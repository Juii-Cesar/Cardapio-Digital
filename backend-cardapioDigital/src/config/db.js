const {Pool} = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.SUPABASE_URL,
  ssl:{
    rejectUnauthorized:false
  }
});

pool.connect((err, client, release)=>{
    if(err) {
        return console.error('Erro ao conectar no supabase', err.stack);
    }
    console.log("conectado com sucesso ao PostgreSQL na nuvem (Supabase)!");
    release();
});

module.exports = pool;