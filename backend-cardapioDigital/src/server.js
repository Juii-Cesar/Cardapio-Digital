const express = require("express");
const cors = require('cors');
require('dotenv').config();
const pool = require("../src/config/db");

//rotas
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const orderRoutes =  require('./routes/orderRoutes');
const promoRoutes = require('./routes/promoRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

//middlewares basicos
app.use(cors());
app.use(express.json());
app.use('/api',productRoutes);
app.use('/api', categoryRoutes);
app.use('/api',deliveryRoutes);
app.use('/api', orderRoutes);
app.use('/api', promoRoutes);
app.use('/api',authRoutes);

//rota de teste
app.get('/', (req,res)=>{
    return res.json({message: "API do Restaurante rodando com sucesso!"});
});

app.listen(PORT,()=>{
    console.log(`Servidor rodando na porta ${PORT}`);
});