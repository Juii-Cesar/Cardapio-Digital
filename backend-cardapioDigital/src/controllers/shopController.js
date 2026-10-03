const db = require('../config/db');

//busca configurações atuais da loja
const getShopConfig = async(req,res)=>{
    try{
        const result = await db.query('SELECT * FROM config_loja WHERE id = 1');

        if (result.rows.length=== 0){
            return res.status(404).json({error: ' configurações da loja não encontradas'});
        }

        return res.status(200).json(result.rows[0])
    }catch(error){
        console.error('erro ao buscar configurações da loja: ', error);
        return res.status(500).json({error: 'erro ao buscar configurações da loja'});
    }
};

// Atualizar configs loja
const updateShopConfig = async (req, res)=>{
    const {aberta, whatsapp, chave_pix, titular_pix, tempo_entrega_min} = req.body;

    try {
      const result = await db.query(
        `UPDATE config_loja
            SET aberta = COALESCE($1, aberta),
           whatsapp = COALESCE($2, whatsapp),
           chave_pix = COALESCE($3, chave_pix),
           titular_pix = COALESCE($4, titular_pix),
           tempo_entrega_min = COALESCE($5, tempo_entrega_min)
            WHERE id = 1
            RETURNING *`,
        [
          aberta !== undefined ? aberta : null,
          whatsapp !== undefined ? whatsapp : null,
          chave_pix !== undefined ? chave_pix : null,
          titular_pix !== undefined ? titular_pix : null,
          tempo_entrega_min !== undefined ? tempo_entrega_min : null,
        ],
      );

      return res.status(200).json({
        message: "Configurações da loja atualizadas com sucesso!",
        config: result.rows[0],
      });
    } catch (error) {
      console.error("Erro ao atualizar configurações da loja:", error);
      return res.status(500).json({ error: "Erro interno ao atualizar configurações." });
    }
};

module.exports={
    getShopConfig,
    updateShopConfig
};