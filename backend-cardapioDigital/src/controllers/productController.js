const db = require("../config/db");
const supabase = require("../config/supabase");

//Lista os produtos com suas categorias e igredientes
const getProducts = async (req, res) => {
  try {
    const productsResult = await db.query(
      `SELECT p.id, p.nome, p.preco, p.descricao, p.url_img_produto, c.nome AS categoria
            FROM produtos p 
            LEFT JOIN categorias c ON p.id_categoria=c.id 
            WHERE p.ativo = true
            ORDER BY c.nome, p.nome`,
    );
    const products = productsResult.rows;

    //Busca os igredientes de cada produto
    const productsWithIngredients = await Promise.all(
      products.map(async (product) => {
        const ingredientsResult = await db.query(
          "Select id, nome FROM itens_produtos WHERE id_produto = $1",
          [product.id],
        );
        return {
          ...product,
          ingredientes: ingredientsResult.rows,
        };
      }),
    );
    return res.status(200).json(productsWithIngredients);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return res
      .status(500)
      .json({ error: "Erro interno ao carregar o cardapio." });
  }
};

//Adicionar novo produto (painel do admin)
const createProduct = async (req, res) => {
  const { id_categoria, nome, preco, descricao, ingredientes } = req.body;
  const imageFile = req.file;

  try {
    let url_img_produto = null;

    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.originalname}`;

      const { data, error } = await supabase.storage
        .from("produtos")
        .upload(fileName, imageFile.buffer, {
          contentType: imageFile.mimetype,
        });
      if (error) {
        console.error("Erro no upload da Imagem: ", error);
        return res
          .status(500)
          .json({ error: "Erro ao fazer upload da imagem." });
      }

      const { data: publicUrlData } = supabase.storage
        .from("produtos")
        .getPublicUrl(fileName);
      url_img_produto = publicUrlData.publicUrl;
    }

    const productsResult = await db.query(
      `INSERT INTO produtos (id_categoria, nome, preco, descricao, url_img_produto)
            VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id_categoria, nome, preco, descricao, url_img_produto],
    );

    const newProduct = productsResult.rows[0];

    //Cadatrar ingredientes(caso tenha)
    if (ingredientes) {
      
      const parsedIngredients =
        typeof ingredientes === "string"
          ? JSON.parse(ingredientes)
          : ingredientes;

      for (const ingrediente of parsedIngredients) {
        await db.query(
          "INSERT INTO itens_produtos (id_produto, nome) VALUES ($1, $2)",
          [newProduct.id, ingrediente],
        );
      }
    }
    return res.status(201).json({
      message: "Produto cadastrado com sucesso!",
      product: newProduct,
    });
  } catch (error) {
    console.error("Erro ao cria produto: ", error);
    return res.status(500).json({ error: "Erro ao cadastar produto." });
  }
};

module.exports = {
  getProducts,
  createProduct,
};
