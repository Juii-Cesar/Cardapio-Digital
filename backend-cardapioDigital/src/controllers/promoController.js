const db = require('../config/db');
const supabase = require('../config/supabase');

//listar promos ativas
const getPromos= async(req, res)=>{
    try{
        const result = await db.query(
            'SELECT * FROM promo WHERE ativo = true ORDER BY criado_em DESC'
        );
        return res.status(200).json(result.rows);
    }catch(error){
        console.error('Erro ao buscas promoções', error);
        return res.status(500).json({error: 'erro interno ao carregar promoções.'});
    }
};

//Criar promo com imagem salva no banco
const createPromo = async (req, res)=>{
    const {nome, preco, descricao}= req.body;
    const imageFile = req.file;

    if(!nome || !preco){
        return res.status(400).json({error: 'Nome e preço da promoção são obrigatórios.'});
    }

    try{
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
                console.error('Erro no upload da imagem da promoção:', error);
                return res.status(500).json({ error: 'Erro ao enviar imagem da promoção'});
            }

            const {data: publicUrlData} = supabase.storage
            .from('produtos')
            .getPublicUrl(fileName);

            url_img= publicUrlData.publicUrl;
        }

        const result = db.query(
            `INSERT INTO promo (nome, preco, descriacao, url_img)
            VALUES ($1, $2, $3, $4) RETURNING *`,
            [nome, preco, descricao || null, url_img]
        );

        return res.status(201).json({
            message: 'Promoção criada com sucesso!',
            promo: result.rows[0]
        });
    }catch(error){
        console.error('Erro ao criar promoção:', error);
        return res.status(500).json({error:'Erro interno ao cadastrar promoção.'});
    }
};

module.exports = {
    getPromos,
    createPromo
};