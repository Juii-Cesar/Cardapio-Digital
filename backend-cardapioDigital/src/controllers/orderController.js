const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//cria pedidoo completo com usuario, endereço e itens do carrinho
const createOrder = async (req, res) => {
  
  const authHeader = req.headers["authorization"];
  let userIdFromToken = null;

  if (authHeader) {
    try {
      const token = authHeader.split(" ")[1];
      if (token) {
        const secret = process.env.JWT_SECRET || "secreta_cardapio_2026";
        const decoded = jwt.verify(token, secret);
        userIdFromToken = decoded.id;
      }
    } catch (err) {
      console.error(
        "Token do cliente no pedido é inválido/expirado:",
        err.message,
      );
    }
  }

  const {
    id_endereco, 
    cliente = {},
    itens,
    observacao_geral,
  } = req.body;

  const {
    nome,
    tel,
    senha,
    rua,
    numero,
    complemento,
    id_bairro,
    cep,
    apelido,
  } = cliente;

 
  if (!userIdFromToken && (!nome || !tel || !senha)) {
    return res
      .status(400)
      .json({
        error:
          "Nome, telefone e senha são obrigatórios para realizar o pedido sem login prévio.",
      });
  }

  if (!itens || !Array.isArray(itens) || itens.length === 0) {
    return res
      .status(400)
      .json({ error: "O pedido deve conter pelo menos um item." });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    
    const shopCheck = await client.query(
      "SELECT aberta FROM config_loja WHERE id = 1",
    );
    if (shopCheck.rows.length > 0 && !shopCheck.rows[0].aberta) {
      await client.query("ROLLBACK");
      client.release();
      return res
        .status(400)
        .json({
          error:
            "A loja está fechada no momento. Não é possível realizar pedidos.",
        });
    }

    
    let userId;

    if (userIdFromToken) {
      userId = userIdFromToken;
    } else {
      const userResult = await client.query(
        "SELECT id, senha_hash FROM usuarios WHERE tel = $1",
        [tel],
      );

      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];

        if (user.senha_hash) {
          const senhaValida = await bcrypt.compare(senha, user.senha_hash);
          if (!senhaValida) {
            await client.query("ROLLBACK");
            client.release();
            return res
              .status(401)
              .json({
                error: "Senha incorreta para o número de telefone informado.",
              });
          }
        } else {
          const salt = await bcrypt.genSalt(10);
          const novaSenhaHash = await bcrypt.hash(senha, salt);
          await client.query(
            "UPDATE usuarios SET senha_hash = $1 WHERE id = $2",
            [novaSenhaHash, user.id],
          );
        }

        userId = user.id;
      } else {
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        const newUser = await client.query(
          "INSERT INTO usuarios (nome, tel, senha_hash) VALUES ($1, $2, $3) RETURNING id",
          [nome, tel, senhaHash],
        );
        userId = newUser.rows[0].id;
      }
    }

   
    let addressId = id_endereco;
    let selectedBairroId = id_bairro;

    if (addressId) {
      
      const addrResult = await client.query(
        "SELECT id_bairro FROM usuario_end WHERE id = $1 AND id_usuario = $2 AND ativo = true",
        [addressId, userId],
      );

      if (addrResult.rows.length === 0) {
        await client.query("ROLLBACK");
        client.release();
        return res
          .status(400)
          .json({
            error:
              "Endereço selecionado é inválido ou não pertence ao usuário.",
          });
      }

      selectedBairroId = addrResult.rows[0].id_bairro;
    } else {
      
      if (!rua || !numero || !id_bairro) {
        await client.query("ROLLBACK");
        client.release();
        return res
          .status(400)
          .json({
            error:
              "Rua, número e bairro são obrigatórios para cadastrar um novo endereço.",
          });
      }

      const newAddrResult = await client.query(
        `INSERT INTO usuario_end (id_usuario, id_bairro, rua, numero, complemento, cep, apelido)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [
          userId,
          id_bairro,
          rua,
          numero,
          complemento || null,
          cep || null,
          apelido || "Entrega",
        ],
      );

      addressId = newAddrResult.rows[0].id;
      selectedBairroId = id_bairro;
    }

   
    const neighborhoodResult = await client.query(
      "SELECT taxa FROM taxas_entrega WHERE id = $1 AND ativo = true",
      [selectedBairroId],
    );

    if (neighborhoodResult.rows.length === 0) {
      await client.query("ROLLBACK");
      client.release();
      return res
        .status(400)
        .json({ error: "Bairro selecionado é inválido ou não está ativo." });
    }

    const taxaEntrega = parseFloat(neighborhoodResult.rows[0].taxa);

   
    let subtotal = 0;
    const itensProcessados = [];

    for (const item of itens) {
      const qtd = parseInt(item.quantidade) || 1;
      let precoUnitario = 0;

      if (item.id_produto) {
        const prodResult = await client.query(
          "SELECT preco, ativo FROM produtos WHERE id = $1",
          [item.id_produto],
        );

        if (prodResult.rows.length === 0 || !prodResult.rows[0].ativo) {
          await client.query("ROLLBACK");
          client.release();
          return res
            .status(400)
            .json({
              error: "Um dos produtos selecionados não está disponível.",
            });
        }

        precoUnitario = parseFloat(prodResult.rows[0].preco);
      } else if (item.id_promo) {
        const promoResult = await client.query(
          "SELECT preco, ativo FROM promo WHERE id = $1",
          [item.id_promo],
        );

        if (promoResult.rows.length === 0 || !promoResult.rows[0].ativo) {
          await client.query("ROLLBACK");
          client.release();
          return res
            .status(400)
            .json({
              error: "Uma das promoções selecionadas não está disponível.",
            });
        }

        precoUnitario = parseFloat(promoResult.rows[0].preco);
      } else {
        await client.query("ROLLBACK");
        client.release();
        return res
          .status(400)
          .json({
            error: "Cada item do pedido deve conter id_produto ou id_promo.",
          });
      }

      subtotal += qtd * precoUnitario;

      itensProcessados.push({
        id_produto: item.id_produto || null,
        id_promo: item.id_promo || null,
        quantidade: qtd,
        observacao: item.observacao || null,
        preco_unitario: precoUnitario,
      });
    }

    const totalGeral = subtotal + taxaEntrega;

  
    const orderResult = await client.query(
      `INSERT INTO pedidos (id_usuario, id_bairro, id_endereco, status, taxa_entrega_aplicada, total, observacao)
       VALUES ($1, $2, $3, 'Pendente', $4, $5, $6) RETURNING *`,
      [
        userId,
        selectedBairroId,
        addressId,
        taxaEntrega,
        totalGeral,
        observacao_geral || null,
      ],
    );

    const newOrder = orderResult.rows[0];


    for (const item of itensProcessados) {
      await client.query(
        `INSERT INTO itens_pedidos (id_pedido, id_produto, id_promo, quantidade, observacao, preco_unitario)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          newOrder.id,
          item.id_produto,
          item.id_promo,
          item.quantidade,
          item.observacao,
          item.preco_unitario,
        ],
      );
    }

    await client.query("COMMIT");
    client.release();

    return res.status(201).json({
      message: "Pedido realizado com sucesso!",
      order: newOrder,
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
      client.release();
    } catch (rollbackErr) {
      console.error("Erro ao executar rollback:", rollbackErr);
    }

    console.error(" Erro na transação do pedido:", error);
    return res.status(500).json({
      error: "Erro interno ao processar pedido.",
      detalhes: error.message,
    });
  }
};

//lista pedidos (funçao admin)
const getOrders = async (req,res)=>{
    try{
        const ordersResult = await db.query(
          `SELECT DISTINCT ON (p.id)
              p.id AS id_pedido,
              p.status,
              p.taxa_entrega_aplicada,
              p.total,
              p.observacao AS observacao_geral,
              p.criado_em,
              u.nome AS cliente_nome,
              u.tel AS cliente_tel,
              te.nome_bairro,
              ue.rua,
              ue.numero,
              ue.complemento,
              ue.cep
            FROM pedidos p
            JOIN usuarios u ON p.id_usuario = u.id
            JOIN taxas_entrega te ON p.id_bairro = te.id
            LEFT JOIN usuario_end ue ON p.id_endereco = ue.id
            ORDER BY p.id, p.criado_em DESC
        `,
        );

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

//Lista o histórico de pedidos do cliente
// Lista o histórico de pedidos do cliente
const getClientOrders = async (req, res) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Formato de token inválido.' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'secreta_cardapio_2026';
    const decoded = jwt.verify(token, secret);
    const id_usuario = decoded.id;

    // DISTINCT ON (p.id) evita duplicatas quando o usuário tem múltiplos endereços
    const ordersResult = await db.query(
      `SELECT 
        p.id AS id_pedido,
        p.status,
        p.taxa_entrega_aplicada,
        p.total,
        p.observacao AS observacao_geral,
        p.criado_em,
        te.nome_bairro,
        ue.rua,
        ue.numero,
        ue.complemento,
        ue.cep,
        ue.apelido
      FROM pedidos p
      JOIN taxas_entrega te ON p.id_bairro = te.id
      LEFT JOIN usuario_end ue ON p.id_endereco = ue.id  -- <- Vínculo direto e exato pelo ID do endereço!
      WHERE p.id_usuario = $1
      ORDER BY p.criado_em DESC`,
      [id_usuario],
    );

    const orders = ordersResult.rows;

    // Ordena por data de criação (mais recentes primeiro) após a remoção de duplicatas
    orders.sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em));

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const itemsResult = await db.query(
          `SELECT
            ip.id,
            ip.quantidade,
            ip.observacao,
            ip.preco_unitario,
            prod.nome AS produto_nome,
            pr.nome AS promo_nome
          FROM itens_pedidos ip
          LEFT JOIN produtos prod ON ip.id_produto = prod.id
          LEFT JOIN promo pr ON ip.id_promo = pr.id
          WHERE ip.id_pedido = $1`,
          [order.id_pedido]
        );

        return {
          ...order,
          itens: itemsResult.rows
        };
      })
    );

    return res.status(200).json(ordersWithItems);

  } catch (error) {
    console.error('Erro ao buscar histórico do cliente:', error);
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};

module.exports = {
    createOrder,
    getOrders,
    updateOrderStatus,
    getClientOrders
};
