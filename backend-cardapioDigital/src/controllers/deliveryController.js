const db = require("../config/db");

//Lista os bairros disponiveis (para o cliente selecionar no checkout ou para o admin)
const getNeighborhood = async (req, res) => {
  try {
    //se receber apenasAtivo=true no req.query lista só bairros ativos
    const { apenasAtivo } = req.query;
    let query = "SELECT * FROM taxas_entrega ORDER BY nome_bairro ASC";
    if (apenasAtivo === "true") {
      query =
        "SELECT * FROM taxas_entrega WHERE ativo = true ORDER BY nome_bairro ASC";
    }

    const result = await db.query(query);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar bairros: ".error);
    return res
      .status(500)
      .json({ error: "Erro interno ao buscar bairros de entrega." });
  }
};

//Adiciona novo bairro com taxa (função admin)
const createNeighborhood = async (req, res) => {
  const { nome_bairro, taxa } = req.body;
  if (!nome_bairro || taxa === undefined || taxa < 0) {
    return res.status(400).json({ error: "Nome ou taxa invalidos" });
  }

  try {
    const result = await db.query(
      `INSERT INTO taxas_entrega (nome_bairro, taxa)
            VALUES($1,$2) RETURNING *`,
      [nome_bairro, taxa],
    );
    return res.status(201).json({
      message: "Bairro adicionado com sucesso!",
      bairro: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao adicionar bairro: ", error);
    return res.status(500).json({ error: "Erro ao adicionar bairro." });
  }
};

//Atualiza a taxa ou o status de um bairro (função admin)
const updateNeighborhood = async (req, res)=>{
  const {id}=  req.params;
  const {nome_bairro, taxa, ativo}= req.body;
  
  try{
    const result = await db.query(
      `UPDATE taxas_entrega
      SET nome_bairro = COALESCE($1, nome_bairro),
      taxa = COALESCE($2, taxa),
      ativo = COALESCE($3,ativo)
      WHERE id =$4
      RETURNING *`,
      [nome_bairro,taxa,ativo,id]
    );
    if (result.rows.length===0){
      return res.status(404).json({error: 'Bairro não encontrado.'});
    }
    return res.status(200).json({
      message: 'Bairro atualizado com sucesso! ',
      bairro: result.rows[0]
    });
  }catch (error){
    console.error('Erro ao atualizar bairro');
    return res.status(500).json({error:'Erro ao atualizar bairro'});
  }
};

module.exports = {
  getNeighborhood,
  createNeighborhood,
  updateNeighborhood
};
