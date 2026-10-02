import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [idCategoria, setIdCategoria] = useState('');
  const [ingredientes, setIngredientes] = useState(''); 
  const [imagem, setImagem] = useState(null); 
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:3000/api/categorias'),
      axios.get('http://localhost:3000/api/produtos')
    ])
    .then(([resCategorias, resProdutos]) => {
      setCategorias(resCategorias.data);
      setProdutos(resProdutos.data);
      if (resCategorias.data.length > 0) {
        setIdCategoria(resCategorias.data[0].id);
      }
    })
    .catch(error => console.error("Erro ao carregar dados:", error))
    .finally(() => setLoading(false));
  }, []);

  const atualizarLista = async () => {
    try {
      const [resCategorias, resProdutos] = await Promise.all([
        axios.get('http://localhost:3000/api/categorias'),
        axios.get('http://localhost:3000/api/produtos')
      ]);
      setCategorias(resCategorias.data);
      setProdutos(resProdutos.data);
    } catch (error) {
      console.error("Erro ao recarregar dados:", error);
    }
  };

  const iniciarEdicao = (produto) => {
    setEditandoId(produto.id);
    setNome(produto.nome);
    setDescricao(produto.descricao || '');
    setPreco(String(produto.preco).replace('.', ','));
    setIdCategoria(produto.id_categoria);
    setImagem(null); 
    
    if (produto.ingredientes && produto.ingredientes.length > 0) {
      setIngredientes(produto.ingredientes.map(i => i.nome).join(', '));
    } else {
      setIngredientes('');
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setNome('');
    setDescricao('');
    setPreco('');
    setIngredientes('');
    setImagem(null);
    const fileInput = document.getElementById('imagem-upload');
    if (fileInput) fileInput.value = '';
    
    if (categorias.length > 0) setIdCategoria(categorias[0].id);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!nome || !preco || !idCategoria) return;

    try {
      const formData = new FormData();
      formData.append('nome', nome);
      formData.append('descricao', descricao);
      formData.append('preco', Number(String(preco).replace(',', '.')));
      formData.append('id_categoria', idCategoria);
      
      if (ingredientes) {
        const ingredientesArray = ingredientes.split(',').map(i => i.trim()).filter(i => i);
        formData.append('ingredientes', JSON.stringify(ingredientesArray));
      }

      if (imagem) {
        formData.append('imagem', imagem);
      }

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      };

      if (editandoId) {
        await axios.put(`http://localhost:3000/api/produtos/${editandoId}`, formData, config);
      } else {
        await axios.post('http://localhost:3000/api/produtos', formData, config);
      }
      
      cancelarEdicao(); 
      atualizarLista();
      toast.success("Salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar. Verifique se o servidor está a rodar.");
    }
  };

  const handleExcluir = async (id, nome) => {
    const confirmar = window.confirm(`Tem a certeza que deseja eliminar o produto "${nome}"?`);
    if (!confirmar) return;

    try {
      await axios.delete(`http://localhost:3000/api/produtos/${id}`);
      atualizarLista();
      toast.success("Eliminado com sucesso!");
    } catch (error) {
      console.error("Erro ao eliminar:", error);
      toast.error("Erro ao eliminar item.");
    }
  };

  if (loading) return <div className="p-4 text-shaday-muted">A carregar cardápio...</div>;

  return (
    <div className="flex flex-col gap-6">
      
      <div className="bg-shaday-card p-5 md:p-6 rounded-2xl border border-white/5 shadow-sm">
        <h2 className="text-white font-bold text-lg mb-6 border-b border-white/10 pb-3">
          {editandoId ? 'Editar Produto' : 'Cadastrar Novo Produto'}
        </h2>
        
        <form onSubmit={handleSalvar} className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm text-shaday-muted mb-1 ml-1">Nome do Produto</label>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Hambúrguer X-Tudo" className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red" required />
            </div>
            
            <div className="w-full md:w-1/3">
              <label className="block text-sm text-shaday-muted mb-1 ml-1">Categoria</label>
              <select value={idCategoria} onChange={(e) => setIdCategoria(e.target.value)} className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red appearance-none" required>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-32">
              <label className="block text-sm text-shaday-muted mb-1 ml-1">Preço (R$)</label>
              <input type="text" value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="0,00" className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red" required />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="flex-1 w-full">
              <label className="block text-sm text-shaday-muted mb-1 ml-1">Descrição</label>
              <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Detalhes do prato..." rows="2" className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red resize-none mb-4" />
              
              <label className="block text-sm text-shaday-muted mb-1 ml-1">Ingredientes (Separados por vírgula)</label>
              <input type="text" value={ingredientes} onChange={(e) => setIngredientes(e.target.value)} placeholder="Pão, Carne 180g, Queijo, Bacon..." className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red" />
            </div>

            <div className="flex-1 w-full flex flex-col justify-between h-full">
              <div>
                <label className="block text-sm text-shaday-muted mb-1 ml-1">Imagem do Produto (Upload)</label>
                <input 
                  id="imagem-upload"
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setImagem(e.target.files[0])} 
                  className="w-full bg-[#121212] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-shaday-red file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white/5 file:text-white hover:file:bg-white/10 transition-all cursor-pointer" 
                />
                {editandoId && <p className="text-xs text-shaday-muted mt-2 ml-1">Deixe em branco para manter a imagem atual.</p>}
              </div>
              
              <div className="flex gap-2 mt-6 h-[50px]">
                <button type="submit" disabled={!nome || !preco} className="flex-1 bg-shaday-red text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50">
                  {editandoId ? 'Salvar Alterações' : 'Adicionar Produto'}
                </button>
                {editandoId && (
                  <button type="button" onClick={cancelarEdicao} className="px-6 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-colors">
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-shaday-card rounded-2xl border border-white/5 shadow-sm p-5 md:p-6">
        <h2 className="text-white font-bold text-lg mb-6 border-b border-white/10 pb-3">Produtos Cadastrados</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {produtos.length === 0 ? (
            <p className="text-shaday-muted col-span-full text-center py-8 border-2 border-dashed border-white/5 rounded-xl">Nenhum produto cadastrado.</p>
          ) : (
            produtos.map((produto) => (
              <div key={produto.id} className="bg-[#121212] rounded-xl border border-white/5 overflow-hidden flex flex-col hover:border-white/10 transition-colors">

                <div className="h-32 bg-black/40 relative">
                  {produto.url_img_produto ? (
                    <img src={produto.url_img_produto} alt={produto.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-shaday-muted text-xs">Sem Imagem</div>
                  )}
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-white/90 uppercase tracking-wider">
                    {categorias.find(c => String(c.id) === String(produto.id_categoria))?.nome || 'Categoria'}
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-white text-base mb-1 truncate">{produto.nome}</h3>
                  <p className="text-shaday-muted text-xs line-clamp-2 mb-1">{produto.descricao}</p>
                  
                  {produto.ingredientes && produto.ingredientes.length > 0 && (
                    <p className="text-white/40 text-[10px] line-clamp-1 mb-2 italic">
                      {produto.ingredientes.map(i => i.nome).join(', ')}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                    <span className="font-bold text-shaday-red">
                      R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                    </span>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => iniciarEdicao(produto)}
                        className="text-xs bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded transition-colors font-medium border border-white/10"
                      >
                        Editar
                      </button>

                      <button 
                        onClick={() => handleExcluir(produto.id, produto.nome)}
                        className="p-1.5 bg-white/5 hover:bg-shaday-red text-white/70 hover:text-white rounded transition-colors border border-white/10 flex items-center justify-center"
                        title="Eliminar Produto"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}