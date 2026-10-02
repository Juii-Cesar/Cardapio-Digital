const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secreta_cardapio_2026";

// Cadastrar novo Administrador 
const registerAdmin = async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res
      .status(400)
      .json({ error: "Nome, e-mail e senha são obrigatórios." });
  }

  try {
    
    const adminExists = await db.query(
      "SELECT id FROM administradores WHERE email = $1",
      [email],
    );
    if (adminExists.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "E-mail já cadastrado para um administrador." });
    }

   
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    
    const result = await db.query(
      `INSERT INTO administradores (nome, email, senha_hash)
       VALUES ($1, $2, $3) RETURNING id, nome, email, criado_em`,
      [nome, email, senhaHash],
    );

    return res.status(201).json({
      message: "Administrador cadastrado com sucesso!",
      admin: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao cadastrar admin:", error);
    return res
      .status(500)
      .json({ error: "Erro interno ao cadastrar administrador." });
  }
};

// Login do Administrador
const loginAdmin = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
  }

  try {
    
    const result = await db.query(
      "SELECT * FROM administradores WHERE email = $1",
      [email],
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const admin = result.rows[0];

    
    const senhaValida = await bcrypt.compare(senha, admin.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: "admin" },
      JWT_SECRET,
      { expiresIn: process.env.JWT_ADMIN_EXPIRES_IN},
    );

    return res.status(200).json({
      message: "Login de administrador realizado com sucesso!",
      token,
      admin: {
        id: admin.id,
        nome: admin.nome,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Erro no login admin:", error);
    return res.status(500).json({ error: "Erro interno ao realizar login." });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
};
