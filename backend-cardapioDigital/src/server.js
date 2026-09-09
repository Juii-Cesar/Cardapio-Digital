const express = require("express");
const cors = require('cors');
require('dotenv').config();
const pool = require("../src/config/db");

const app = express();
const PORT = process.env.PORT || 3000;

//middlewares basicos
app.use(cors());
app.use(express.json());

//rota de teste
app.get('/', (req,res)=>{
    return res.json({message: "API do Restaurante rodando com sucesso!"});
});

app.listen(PORT,()=>{
    console.log(`Servidor rodando na porta ${PORT}`);
});