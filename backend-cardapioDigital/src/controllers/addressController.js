const db = require("../config/db");
const jwt = require("jsonwebtoken");

const getUserIdFromToken = (req) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return null;
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    return null;
  }
};

const getClientAddress = async (req, res) => {
  const id_usuario = getUserIdFromToken(req);

  if (!id_usuario) {
    return res
      .status(401)
      .json({ error: "Acesso negado. token de cliente necessário" });
  }

  try {
    const result = await db.query(
      `SELECT
            e.id,
            e.apelido,
            e.rua,
            e.numero,
            e.complemento,
            e.cep,
            e.id_bairro,
            t.nome_bairro,
            t.taxa
            FROM usuario_end e
            JOIN taxas_entrega t ON e.id_bairro = t.id
            WHERE e.id_usuario = $1 AND e.ativo = true
            ORDER BY e.apelido DESC`,
      [id_usuario],
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar endereços:", error);
    return res.status(500).json({ error: "Erro interno ao buscar endereços." });
  }
};

const createAddress = async (req, res) => {
  const id_usuario = getUserIdFromToken(req);
  const { id_bairro, rua, numero, complemento, cep, apelido } = req.body;

  if (!id_usuario) {
    return res
      .status(401)
      .json({ error: "Acesso negado. token de cliente necessário" });
  }

  if (!id_bairro || !rua || !numero) {
    return res
      .status(400)
      .json({ error: "Bairro, rua e numero são obrigatorios" });
  }

  try {
    const result = await db.query(
      `INSERT INTO usuario_end (id_usuario, id_bairro, rua, numero, complemento, cep, apelido)
            VALUES($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
      [
        id_usuario,
        id_bairro,
        rua,
        numero,
        complemento || null,
        cep || null,
        apelido || "casa",
      ],
    );
    return res.status(201).json({
      message: "Endereço cadastrado com sucesso!",
      endereco: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao cadastrar endereço:", error);
    return res
      .status(500)
      .json({ error: "Erro interno ao cadastrar endereço." });
  }
};

const updateAddress = async (req, res) => {
  const id_usuario = getUserIdFromToken(req);
  const { id } = req.params;
  const { id_bairro, rua, numero, complemento, cep, apelido } = req.body;

  if (!id_usuario) {
    return res
      .status(401)
      .json({ error: "Acesso negado. Token de cliente necessário." });
  }

  try {
    const result = await db.query(
      `UPDATE usuario_end
       SET id_bairro = COALESCE($1, id_bairro),
           rua = COALESCE($2, rua),
           numero = COALESCE($3, numero),
           complemento = COALESCE($4, complemento),
           cep = COALESCE($5, cep),
           apelido = COALESCE($6, apelido)
       WHERE id = $7 AND id_usuario = $8
       RETURNING *`,
      [id_bairro, rua, numero, complemento, cep, apelido, id, id_usuario],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Endereço não encontrado ou não pertence a este usuário.",
      });
    }

    return res.status(200).json({
      message: "Endereço atualizado com sucesso!",
      endereco: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao atualizar endereço:", error);
    return res
      .status(500)
      .json({ error: "Erro interno ao atualizar endereço." });
  }
};

const deleteAddress = async (req, res) => {
  const id_usuario = getUserIdFromToken(req);
  const { id } = req.params;

  if (!id_usuario) {
    return res
      .status(401)
      .json({ error: "Acesso negado. Token de cliente necessário." });
  }

  try {
    const result = await db.query(
      `UPDATE usuario_end SET ativo = false WHERE id = $1 AND id_usuario = $2 RETURNING *`,
      [id, id_usuario],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Endereço não encontrado." });
    }

    return res.status(200).json({ message: "Endereço removido com sucesso!" });
  } catch (error) {
    console.error("Erro ao remover endereço:", error);
    return res.status(500).json({ error: "Erro interno ao remover endereço." });
  }
};

module.exports = {
  getClientAddress,
  createAddress,
  updateAddress,
  deleteAddress,
};