const db = require('../config/db');

//cria uma nova categoria
const createCategory = async (req, res)=>{
    const {nome} = req.body;

    try{
        const result = await db.query(
            'INSERT INTO categorias (nome) VALUES ($1) RETURNING *',
            [nome]
        );

        return res.status(201).json({
            message: 'Categoria criada com sucesso!',
            category: result.rows[0]
        });
    } catch(error){
        console.error('Erro ao criar categoria:', error);
        return res.status(500).json({error:'Erro ao criar categoria.'});
    }
};

//lista todas as categorias
const  getCategories = async(req, res)=>{
    try{
        const result = await db.query('SELECT * FROM categorias ORDER BY nome');
        return res.status(200).json(result.rows)
    } catch (error){
        console.error('Erro ao buscar categorias: ', error);
        return res.status(500).json({error: 'Erro ao buscar categorias. '});
    }
};

module.exports= {
    createCategory,
    getCategories
};