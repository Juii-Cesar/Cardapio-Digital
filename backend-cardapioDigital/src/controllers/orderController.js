const db = require('../config/db');

//cria pedidoo completo com usuario, endereço e itens do carrinho
const createOrder= async(req, res)=>{
    const{
        cliente: {nome, tel, rua, numero, complemento, id_bairro, cep},
        itens, //recebe array com id produto ou da promo, qtd, obs
        observacao_geral
    }= req.body;


    //validaçao de entrada
    if (!nome || !tel || !rua || !numero || !id_bairro){
        return res.status(400).json({error: 'Dados do cliente, endereço e bairro são obrigatorios.'});
    }

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({error: 'o pedido deve conter pelo menos um item.'});
    }

    const client = await db.connect();

    try{
        await client.query('BEGIN');

        const neighborhoodResult = await client.query(
            'SELECT taxa FROM taxas_entrega WHERE id = $1 AND ativo = true',
            [id_bairro]
        );

        if(neighborhoodResult.rows.length === 0){
            await client.query('ROLLBACK');
            client.release();
            return res.status(400).json({ error: 'Bairro selecionado é invalido ou não está ativo'});
        }

        const taxaEntrega = parseFloat(neighborhoodResult.rows[0].taxa);

        let userId;
        const userResult = await client.query(
            'SELECT id FROM usuarios WHERE tel = $1',
            [tel]
        );

        if ( userResult.rows.length > 0) {
            userId = userResult.rows[0].id;
        } else {
            const newUser = await client.query(
                'INSERT INTO usuarios (nome,tel) VALUES ($1, $2) RETURNING id',
                [nome,tel]
            );
            userId = newUser.rows[0].id;
        }

        await client.query(
            `INSERT INTO usuario_end (id_usuario, id_bairro, rua, numero, complemento, cep)
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, id_bairro, rua, numero, complemento || null, cep || null]
        );

        let subtotal = 0;
        const itensProcessados = [];

        for (const item of itens){
            const qtd = parseInt(item.quantidade) || 1;
            let precoUnitario = 0;

            if(item.id_produto){
                const prodResult = await client.query(
                    'SELECT preco, ativo FROM produtos WHERE id = $1',
                    [item.id_produto]
                );

                if (prodResult.rows.length === 0 || !prodResult.rows[0].ativo){
                    await client.query('ROLLBACK');
                    client.release();
                    return res.status(400).json({error: 'Produto selecionado não está disponivel.'});
                }

                precoUnitario = parseFloat(prodResult.rows[0].preco);
            } else if (item.id_promo){
                const promoResult= await client.query(
                    'SELECT preco,ativo FROM promo WHERE id=$1',
                    [item.id_promo]
                );
                if(promoResult.rows.length === 0 || !promoResult.rows[0].ativo){
                    await client.query('ROLLBACK');
                    client.release();
                    return res.status(400).json({error:'combo/promoção nao esta disponivel.'});
                }

                precoUnitario = parseFloat(promoResult.rows[0].preco);
            } else{
                await client.query('ROLLBACK');
                client.release();
                return res.status(400).json({error: 'Item do pedido deve conter um id_produto ou id_promo'});
            }

            subtotal +=qtd * precoUnitario;

            itensProcessados.push({
              id_produto: item.id_produto || null,
              id_promo: item.id_promo || null,
              quantidade: qtd,
              observacao: item.observacao || null,
              preco_unitario: precoUnitario, // Preço capturado com segurança do banco
            });

        }
        const totalGeral = subtotal + taxaEntrega;

        const orderResult = await client.query(
            `INSERT INTO pedidos (id_usuario, id_bairro, status, taxa_entrega_aplicada, total, observacao)
            VALUES ($1, $2, 'Pendente', $3, $4, $5) RETURNING *`,
            [userId, id_bairro, taxaEntrega, totalGeral, observacao_geral || null]
        );

        const newOrder = orderResult.rows[0];

        for(const item of itensProcessados){
            await client.query(
                `INSERT INTO itens_pedidos (id_pedido, id_produto, id_promo, quantidade, observacao, preco_unitario)
                VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    newOrder.id,
                    item.id_produto,
                    item.id_promo,
                    item.quantidade,
                    item.observacao,
                    item.preco_unitario
                ]
            );
        }

        await client.query('COMMIT');
        client.release();
        
        return res.status(201).json({
            message: 'Pedido Realizado com sucesso!',
            order: newOrder
        });
        
    } catch (error) {
        try {
            await client.query('ROLLBACK');
            client.release();
        } catch (rollbackErr) {
            console.error('Erro ao fazer rollback:', rollbackErr);
        }

        console.error(' ERRO DETALHADO NA TRANSAÇÃO:', error);

        return res.status(500).json({
            error: 'Erro interno ao processar pedido',
            mensagem: error.message,
            detalhes: error.stack
        });
    }
};

//lista pedidos (funçao admin)
const getOrders = async (req,res)=>{
    try{
        const ordersResult = await db.query(
            `SELECT
              p.id AS id_pedido,
              p.status,
              p.taxa_entrega_aplicada,
              p.total,
              p.observacao AS observacao_geral,
              p.criado_em,
              u.nome AS cliente_nome,
              u.tel AS cliente_tel,
              te.nome_bairro
            FROM pedidos p
            JOIN usuarios u ON p.id_usuario = u.id
            JOIN taxas_entrega te ON p.id_bairro = te.id
            ORDER BY p.criado_em DESC
        `);

        const orders = ordersResult.rows;

        const orderswithItems = await Promise.all(
            orders.map(async (order)=>{
                const itemsResult = await db.query (`
                    SELECT
                      ip.id,
                      ip.quantidade,
                      ip.observacao,
                      ip.preco_unitario,
                      prod.nome AS produto_nome,
                      pr.nome AS promo_nome
                    FROM itens_pedidos ip
                    LEFT JOIN produtos prod ON ip.id_produto = prod.id
                    LEFT JOIN promo pr ON ip.id_promo = pr.id
                    WHERE ip.id_pedido = $1
                `, [order.id_pedido]);

                return{
                    ...order,
                    itens: itemsResult.rows
                };
            })
        );

        return res.status(200).json(orderswithItems);
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        return res.status(500).json({error: 'Erro interno na busca de pedidos'});
    }
};

// Atualiza o status do pedido (painel admin)
const updateOrderStatus = async (req, res) => {

  const id = req.params?.id || req.params?.id_pedido || req.body?.id;
  const { status } = req.body;

  console.log("ATUALIZANDO STATUS DO PEDIDO");
  console.log("Params recebidos:", req.params);
  console.log("ID do Pedido:", id);
  console.log("Novo Status:", status);

  if (!id) {
    return res
      .status(400)
      .json({ error: "ID do pedido não informado na URL." });
  }

  if (!status) {
    return res.status(400).json({ error: "Novo status é obrigatório." });
  }

  try {
    const result = await db.query(
      "UPDATE pedidos SET status = $1 WHERE id = $2 RETURNING *",
      [status, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    return res.status(200).json({
      message: "Status do pedido atualizado com sucesso!",
      order: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error);
    return res
      .status(500)
      .json({ error: "Erro ao atualizar status do pedido." });
  }
};

module.exports = {
    createOrder,
    getOrders,
    updateOrderStatus
};
