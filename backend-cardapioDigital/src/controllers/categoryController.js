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

const updateCategory = async(req,res)=>{
    const {id}= req.params;
    const {nome, ativo} = req.body;

    try{
        const result = await db.query(
          `UPDATE categorias 
            SET nome = COALESCE($1, nome),
            ativo = COALESCE($2, ativo)
            WHERE id = $3 RETURNING *`,
          [nome,ativo, id]
        );

        if(result.rows.length === 0){
            return res.status(404).json({error:'Categoria nao encontrada'})
        }

        return res.status(200).json({
            message: 'categoria atualizada com sucesso!',
            categoria: result.rows[0]
        })

    }catch(error){
        console.error('Erro interno ao atualizar categoria: ',error);
        return res.status(500).json({error: 'Error interno ao atualizar categoria'});
    }
};

const deleteCategory = async(req, res)=>{
    const {id}= req.params;
    try{
        console.log (id);
        const result = await db.query(`
            UPDATE categorias
            SET ativo = false
            WHERE id = $1 RETURNING *`,
            [id]
        );
        if(result.rows.length===0){
            return res.status(404).json({error: 'categoria nao encontrada'});
        };
        return res.status(200).json({message:'categoria desativada com sucesso!'});
    }catch(error){
        console.error('Erro interno ao deletar categoria: ', error);
        return res.status(500).json({error:'erro interno ao deletar categoria'});
    }
};

module.exports= {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
};