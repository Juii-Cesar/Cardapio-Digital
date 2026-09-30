const db = require('../config/db');
const supabase = require('../config/supabase');

//listar promos ativas
const getPromos= async(req, res)=>{
    try{
        const promoResult = await db.query(
            'SELECT * FROM promo WHERE ativo = true ORDER BY criado_em DESC'
        );

        const promos = promoResult.rows;

        const promosWithItems = await Promise.all(
            promos.map(async(promo)=>{
                const itemsResult = await db.query(
                    `SELECT
                    ip.id,
                    ip.quantidade,
                    p.id AS id_produto,
                    p.nome AS produto_nome,
                    p.descricao AS produto_descricao,
                    p.url_img_produto
                    FROM itens_promo ip
                    JOIN produtos p ON ip.id_produto=p.id
                    WHERE ip.id_promo = $1`,
                    [promo.id]
                );
                return{
                    ...promo,
                    produto_inclusos: itemsResult.rows
                };
            })
        );

        return res.status(200).json(promosWithItems);
    }catch(error){
        console.error('Erro ao buscas promoções', error);
        return res.status(500).json({error: 'erro interno ao carregar promoções.'});
    }
};

//Criar promo com imagem salva no banco
const createPromo = async (req, res)=>{
    const {nome, preco, descricao, itens}= req.body;
    const imageFile = req.file;

    if(!nome || !preco){
        return res.status(400).json({error: 'Nome e preço da promoção são obrigatórios.'});
    }

    const client = await db.connect();
    try{

        await client.query('BEGIN');

        let url_img = null;
        
        if(imageFile){
            const fileName = `promo-${Date.now()}-${imageFile.originalname.replace(/\s+/g, '-')}`;

            const{data, error}= await supabase.storage
            .from('produtos')
            .upload(fileName, imageFile.buffer, {
                contentType: imageFile.mimetype,
                duplex: 'half'
            });

            if(error){
                await client.query('ROLLBACK');
                client.release();
                console.error('Erro no upload da imagem da promoção:', error);
                return res.status(500).json({ error: 'Erro ao enviar imagem da promoção'});
            }

            const {data: publicUrlData} = supabase.storage
            .from('produtos')
            .getPublicUrl(fileName);

            url_img= publicUrlData.publicUrl;
        }

        const promoresult = await client.query(
            `INSERT INTO promo (nome, preco, descricao, url_img)
            VALUES ($1, $2, $3, $4) RETURNING *`,
            [nome, preco, descricao || null, url_img]
        );

        const newPromo = promoresult.rows[0];

        if(itens){
            let parsedItens = [];
            try{
                parsedItens = typeof itens === 'string' ? JSON.parse(itens) : itens;
            }catch (error){
                console.error('Erro ao tranformar itens em json', error);
            }
            if(Array.isArray(parsedItens)&& parsedItens.length > 0 ){
                for(const item of parsedItens){
                    if(item.id_produto){
                        await client.query(
                            `INSERT INTO itens_promo (id_promo, id_produto, quantidade)
                            VALUES ($1, $2, $3)`,
                            [newPromo.id, item.id_produto, item.quantidade || 1]
                        );
                    }
                }
            }
        }

        await client.query('COMMIT');
        client.release();

        return res.status(201).json({
            message: 'Promoção criada com sucesso!',
            promo: newPromo
        });
    }catch(error){
        console.error('Erro ao criar promoção:', error);
        return res.status(500).json({error:'Erro interno ao cadastrar promoção.'});
    }
};

//editar promos aticas 

const updatePromo = async (req, res)=>{
  const {id}= req.params;
  const {nome,preco,descricao,ativo}=req.body

  try{
    const result = await db.query(
      `UPDATE promo
      SET nome = COALESCE($1, nome),
      preco = COALESCE($2, preco),
      descricao = COALESCE($3, descricao),
      ativo = COALESCE($4, ativo)
      WHERE id = $5
      RETURNING *`,
      [nome, preco, descricao, ativo, id]
    );
    if(result.rows.length === 0){
      return res.status(404).json({error:'Promoção nao encontrada'})
    }
    return res.status(200).json({
      message: 'promo atualizada com sucesso!',
      promo: result.rows[0]
    });
  }catch(error){
    console.error('erro interno ao atualizar promo', error);
    return res.status(500).json({error: 'erro interno ao atualizar promo'});
  }
};

//remove promo (soft delete)
const deletePromo = async(req, res)=>{
  const {id}= req.params;
  try{
    const result = await db.query('UPDATE promo SET ativo = false WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length===0){
      return res.status(404).json({error: 'promo nao encontrada'})
    }
    return res.status(200).json({
      message: 'promo removida do cardapio com sucesso',
    });
  }catch(error){
    console.error('error: erro ao remover promo', error);
    return res.status(500).json({error:'erro interno ao remover promo'});
  }
};

module.exports = {
    getPromos,
    createPromo,
    updatePromo,
    deletePromo
};