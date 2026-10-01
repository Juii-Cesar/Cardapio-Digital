const db = require('../config/db');
const bcrypt = require('bcryptjs');

const loginCliente = async (req,res)=>{
    const {tel,senha} = req.body;

    if(!tel || !senha){
        return res.status(400).json({error: 'senha e tel são obrigatorios.'});
    }

    try{
        const result = await db.query(
            'SELECT * FROM usuarios WHERE tel=$1',
            [tel]
        );

        if (result.rows.length ===0 ){
            return res.status(404).json({error: 'usuario nao cadastrado'});
        }
        const cliente = result.rows[0];

        const senhaValida = await bcrypt.compare(senha, cliente.senha_hash);
        if(!senhaValida){
            return res.status(401).json({error:'senha incorreta'});
        } 
        return res.status(200).json({
            message: 'Login realizado com sucesso!',
            cliente:{
                id:cliente.id,
                nome:cliente.nome,
                tel:cliente.tel
            }
        });
    }catch(error){
       console.error("Erro no login do cliente:", error);
       return res.status(500).json({ error: "Erro ao realizar login do cliente." }); 
    }
};

const createCliente = async (req, res)=>{
    const{nome, tel, senha, confirmaSenha} = req.body

    if (senha===confirmaSenha){
        return res.status(400).json({error:'confirmação de senha incorreta'});
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    try{

        const telResult = await db.query('SELECT COUNT(*)FROM usuarios WHERE tel=$1',[tel]);
        if(telResult.rows[0].count>0){
            return res.status(409).json({error:'ja existe um usuario cadastrado com esse tel'});
        }


        const result = await db.query(
            `INSERT INTO usuarios(nome,tel,senha_hash)VALUES($1, $2, $3) RETURNING *`,
            [nome, tel, senhaHash]
        );

        return res.status(201).json({
            message: 'usuario cadastrado com sucesso!',
            user: result.rows[0]
        });
    }catch(error){
        console.error('Erro interno ao cadastrar usuario: ', error);
        return res.status(500).json({error:'erro interno ao cadastrar cliente'});
    }
};

module.exports={loginCliente, createCliente};
