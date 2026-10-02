const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET

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

        const token = jwt.sign(
          {
            id: cliente.id,
            tel: cliente.tel,
            nome: cliente.nome,
            role: "cliente",
          },
          JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN },
        );

        return res.status(200).json({
            message: 'Login realizado com sucesso!',
            token,
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
    const{nome, tel, senha, confirmaSenha, perguntaSecreta, respostaSecreta} = req.body

    if (!nome || !tel || !senha) {
      return res
        .status(400)
        .json({ error: "Nome, telefone e senha são obrigatórios." });
    }

    if (senha!==confirmaSenha){
        return res.status(400).json({error:'confirmação de senha incorreta'});
    }

    if(!perguntaSecreta || !respostaSecreta){
        return res.status(400).json({error:'pergunta e resposta secretas sao obrigatorias'});
    }

    try{

        const telResult = await db.query('SELECT COUNT(*)FROM usuarios WHERE tel=$1',[tel]);
        if(telResult.rows[0].count>0){
            return res.status(409).json({error:'ja existe um usuario cadastrado com esse tel'});
        }

        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        const respostaFormatada = respostaSecreta.trim().toLowerCase();
        const respostaSecretaHash = await bcrypt.hash(respostaFormatada, salt);

        const result = await db.query(
            `INSERT INTO usuarios(nome,tel,senha_hash, pergunta_secreta, resposta_secreta_hash)
            VALUES($1, $2, $3, $4, $5) RETURNING id, nome, tel, pergunta_secreta`,
            [nome, tel, senhaHash, perguntaSecreta, respostaSecretaHash]
        );

        const newClient = result.rows[0];

        const token = jwt.sign(
          {
            id: newClient.id,
            tel: newClient.tel,
            nome: newClient.nome,
            role: "cliente",
          },
          JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN },
        );

        return res.status(201).json({
            message: 'usuario cadastrado com sucesso!',
            token,
            user: newClient
        });
    }catch(error){
        console.error('Erro interno ao cadastrar usuario: ', error);
        return res.status(500).json({error:'erro interno ao cadastrar cliente'});
    }
};


const getPerguntaSecreta = async (req, res) => {
    const { tel } = req.body;

    if (!tel) {
        return res.status(400).json({ error: 'Número de telefone é obrigatório.' });
    }

    try {
        const result = await db.query(
            'SELECT pergunta_secreta FROM usuarios WHERE tel = $1',
            [tel]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Telefone não cadastrado no sistema.' });
        }

        const pergunta = result.rows[0].pergunta_secreta;

        if (!pergunta) {
            return res.status(400).json({ error: 'Este usuário não possui uma pergunta secreta cadastrada.' });
        }

        return res.status(200).json({
            tel,
            pergunta_secreta: pergunta
        });
    } catch (error) {
        console.error('Erro ao buscar pergunta secreta:', error);
        return res.status(500).json({ error: 'Erro interno ao buscar pergunta secreta.' });
    }
};


const resetPasswordWithPergunta = async (req, res) => {
    const { tel, respostaSecreta, novaSenha, confirmaNovaSenha } = req.body;

    if (!tel || !respostaSecreta || !novaSenha) {
        return res.status(400).json({ error: 'Telefone, resposta secreta e nova senha são obrigatórios.' });
    }

    if (novaSenha !== confirmaNovaSenha) {
        return res.status(400).json({ error: 'A confirmação da nova senha não confere.' });
    }

    try {
        const result = await db.query(
            'SELECT id, resposta_secreta_hash FROM usuarios WHERE tel = $1',
            [tel]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        const user = result.rows[0];

        if (!user.resposta_secreta_hash) {
            return res.status(400).json({ error: 'Usuário não tem pergunta/resposta secreta cadastrada.' });
        }

        // Valida se a resposta conferem (ignorando maiúsculas/minúsculas)
        const respostaFormatada = respostaSecreta.trim().toLowerCase();
        const respostaValida = await bcrypt.compare(respostaFormatada, user.resposta_secreta_hash);

        if (!respostaValida) {
            return res.status(401).json({ error: 'Resposta secreta incorreta.' });
        }

        // Criptografa a nova senha e atualiza
        const salt = await bcrypt.genSalt(10);
        const novaSenhaHash = await bcrypt.hash(novaSenha, salt);

        await db.query('UPDATE usuarios SET senha_hash = $1 WHERE id = $2', [novaSenhaHash, user.id]);

        return res.status(200).json({
            message: 'Senha redefinida com sucesso! Você já pode fazer login com a nova senha.'
        });
    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        return res.status(500).json({ error: 'Erro interno ao redefinir senha.' });
    }
};

module.exports={loginCliente, createCliente,resetPasswordWithPergunta,getPerguntaSecreta};
