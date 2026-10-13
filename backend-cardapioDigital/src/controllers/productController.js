const db = require("../config/db");
const supabase = require("../config/supabase");

//Lista os produtos com suas categorias e igredientes
const getProducts = async (req, res) => {
  try {
    const productsResult = await db.query(
      `SELECT p.id, p.id_categoria, p.nome, p.preco, p.descricao, p.url_img_produto, c.nome AS categoria
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

//atualiza um produto existente
const updateProduct = async(req,res)=>{
  const{id}=req.params;
  const {id_categoria, nome, preco, descricao, ativo}= req.body;

  try{
    const result = await db.query(
      `UPDATE produtos
       SET id_categoria = COALESCE($1, id_categoria),
           nome = COALESCE($2, nome),
           preco = COALESCE($3, preco),
           descricao = COALESCE($4, descricao),
           ativo = COALESCE($5, ativo)
       WHERE id = $6
       RETURNING *`,
      [id_categoria, nome, preco, descricao, ativo, id],
    );

    if(result.rows.length=== 0){
      return res.status(404).json({error:'produto nao encontrado'});
    }
    return res.status(200).json({
      message:'produto atualizado com sucesso!',
      product: result.rows[0]
    });
  }catch(error){
    console.error('Erro interno ao atualizar produto: ',error);
    return res.status(500).json({error:'erro interno ao atualizar produto.'});
  }
}

//remove produto do cardapio
const deleteProduct = async (req, res)=>{
  const {id}= req.params;

  try{
    const result = await db.query(
      `UPDATE produtos
      SET ativo = false
      WHERE id = $1
      RETURNING *`,
      [id]
    );

    if(result.rows.length === 0){
      return res.status(404).json({error: 'produto nao encontrado'});
    }

    return res.status(200).json({
      message: 'Produto removido com sucesso!'
    });
  }catch(error){
    console.error("Erro ao remover produto: ", error);
    return res.status(500).json({error:'erro interno ao remover produto'});
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
