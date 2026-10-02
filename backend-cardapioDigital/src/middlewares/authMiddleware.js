const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const verifyAdminToken = (req, res, next)=>{
    const authHeader = req.headers['authorization'];

    if(!authHeader){
        return res.status(401).json({error:'Acesso megado. Token de autorização nao fornecido.'});   
    }

    const token = authHeader.split(' ')[1];

    if(!token){
        return res.status(401).json({error: 'Formato de token invalido. use "Bearer TOKEN"(sem aspas no token!).'});
    }

    try{
        const verified = jwt.verify(token, JWT_SECRET);

        if (verified.role !== 'admin') {
            return res.status(403).json({error: 'Acesso negado. recurso exclusivo para admins'});
        }

        req.user = verified;
        next();
    }catch(error){
        return res.status(403).json({error: 'Token invalido ou expirado'});
    }
};

module.exports = verifyAdminToken;