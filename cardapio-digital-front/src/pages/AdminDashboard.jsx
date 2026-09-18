import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import logoImg from '../assets/logo.png';

export default function AdminDashboard() {

  const [categorias, setCategorias] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [statusCategoria, setStatusCategoria] = useState('');

  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [idCategoria, setIdCategoria] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagemFile, setImagemFile] = useState(null);
  const [imagemPreview, setImagemPreview] = useState(null);

  const [ingredientes, setIngredientes] = useState([]);
  const [ingredienteInput, setIngredienteInput] = useState('');
  const [statusEnvio, setStatusEnvio] = useState(''); 

  const fileInputRef = useRef(null);

  const carregarCategorias = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/categorias');
      setCategorias(response.data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  useEffect(() => {
    carregarCategorias();
  }, []);

  const handleCreateCategoria = async (e) => {
    e.preventDefault();
    if (!novaCategoria.trim()) return;

    setStatusCategoria('Salvando...');
    try {
      await axios.post('http://localhost:3000/api/categorias', { nome: novaCategoria });
      setStatusCategoria('Categoria criada.');
      setNovaCategoria('');
      carregarCategorias();
      
      setTimeout(() => setStatusCategoria(''), 3000);
    } catch (error) {
      console.error(error);
      setStatusCategoria('Erro ao criar.');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagemFile(file);
      setImagemPreview(URL.createObjectURL(file));
    }
  };

  const adicionarIngrediente = (e) => {
    e.preventDefault();
    if (ingredienteInput.trim() !== '') {
      setIngredientes([...ingredientes, ingredienteInput.trim()]);
      setIngredienteInput('');
    }
  };

  const removerIngrediente = (indexParaRemover) => {
    setIngredientes(ingredientes.filter((_, index) => index !== indexParaRemover));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      adicionarIngrediente(e);
    }
  };

  const handleSubmitProduto = async (e) => {
    e.preventDefault();
    
    if (!nome || !preco || !idCategoria) {
      setStatusEnvio('Preencha nome, preço e escolha uma categoria!');
      return;
    }

    setStatusEnvio('Salvando produto...');

    try {
      const formData = new FormData();
      formData.append('id_categoria', idCategoria); 
      formData.append('nome', nome);
      formData.append('preco', parseFloat(preco));
      formData.append('descricao', descricao);
      
      if (ingredientes.length > 0) {
        formData.append('ingredientes', JSON.stringify(ingredientes));
      }

      if (imagemFile) {
        formData.append('imagem', imagemFile);
      }

      const response = await axios.post('http://localhost:3000/api/produtos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.status === 201) {
        setStatusEnvio('Produto adicionado ao cardápio.');
        setNome(''); setPreco(''); setIdCategoria(''); setDescricao(''); 
        setIngredientes([]); setImagemFile(null); setImagemPreview(null);
        if(fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error(error);
      setStatusEnvio('Erro ao salvar.');
    }
  };

  return (
    <div className="min-h-screen bg-shaday-bg text-white p-4 md:p-8">
      
      <header className="max-w-2xl mx-auto flex items-center justify-center gap-3 mb-8">
        <img src={logoImg} alt="Logo Sushi Shaday" className="h-14 w-auto object-contain" />
        <h2 className="text-xl font-bold tracking-widest text-shaday-red uppercase">Painel da Loja</h2>
      </header>

      <div className="max-w-2xl mx-auto bg-shaday-card p-6 rounded-xl shadow-lg border border-white/5 mb-6">
        <h2 className="text-lg font-bold text-white mb-4">Gerenciar Categorias</h2>
        <form onSubmit={handleCreateCategoria} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm text-shaday-muted mb-1 ml-1">Nova Categoria</label>
            <input 
              type="text" 
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value)}
              className="w-full bg-[#121212] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-shaday-red" 
              placeholder="Ex: Hambúrgueres" 
            />
          </div>
          <button type="submit" className="bg-white/10 hover:bg-shaday-red text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
            Adicionar
          </button>
        </form>
        {statusCategoria && <p className="text-sm mt-3 text-shaday-red">{statusCategoria}</p>}
      </div>

      <div className="max-w-2xl mx-auto bg-shaday-card p-6 md:p-8 rounded-xl shadow-lg border border-white/5">
        <h1 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">
          Novo Produto
        </h1>
        
        <form className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm text-shaday-muted mb-1 ml-1">Nome do Produto</label>
              <input 
                type="text" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-shaday-red transition-colors" 
                placeholder="Ex: Hot Roll Especial" 
              />
            </div>
            <div className="w-full md:w-1/3">
              <label className="block text-sm text-shaday-muted mb-1 ml-1">Preço (R$)</label>
              <input 
                type="number" 
                step="0.01"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-shaday-red transition-colors" 
                placeholder="00.00" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-shaday-muted mb-1 ml-1">Categoria</label>
            <select 
              value={idCategoria}
              onChange={(e) => setIdCategoria(e.target.value)}
              className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-shaday-red transition-colors appearance-none cursor-pointer"
            >
              <option value="">Selecione a categoria...</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </select>
          </div>

          <div className="bg-[#121212] p-4 rounded-lg border border-white/5">
            <label className="block text-sm text-shaday-muted mb-2 ml-1">
              Ingredientes (Opções de "Retirar" para o cliente)
            </label>
            <div className="flex gap-2 mb-3">
              <input 
                type="text" 
                value={ingredienteInput}
                onChange={(e) => setIngredienteInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-shaday-card border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-shaday-red transition-colors text-sm" 
                placeholder="Ex: Cebolinha" 
              />
              <button 
                type="button" 
                onClick={adicionarIngrediente}
                className="bg-white/10 hover:bg-shaday-red text-white px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Adicionar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ingredientes.length === 0 ? (
                <span className="text-xs text-white/30 italic">Nenhum ingrediente adicionado...</span>
              ) : (
                ingredientes.map((ing, index) => (
                  <span key={index} className="bg-shaday-red/20 text-shaday-red border border-shaday-red/30 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {ing}
                    <button type="button" onClick={() => removerIngrediente(index)} className="text-white hover:text-red-500 font-bold">×</button>
                  </span>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-shaday-muted mb-1 ml-1">Descrição Comercial (Opcional)</label>
            <textarea 
              rows="2" 
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-shaday-red transition-colors resize-none" 
              placeholder="Ex: O prato mais pedido da casa! Serve 2 pessoas."
            ></textarea>
          </div>

          <div>
            <label className="block text-sm text-shaday-muted mb-1 ml-1">Foto do Produto</label>
            <div className="flex items-center gap-4 mt-1">
              <label className="cursor-pointer bg-[#121212] border border-dashed border-white/20 hover:border-shaday-red rounded-lg p-6 flex-1 flex flex-col items-center justify-center transition-colors group">
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform"></span>
                <span className="text-sm text-shaday-muted group-hover:text-white transition-colors">
                  Clique para anexar a imagem
                </span>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
              
              {imagemPreview && (
                <div className="shrink-0 relative">
                  <img src={imagemPreview} alt="Preview" className="w-28 h-28 rounded-lg object-cover bg-black shadow-md border border-white/10" />
                </div>
              )}
            </div>
          </div>

          {statusEnvio && (
            <div className={`p-3 rounded-lg text-center font-medium ${statusEnvio.includes('❌') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
              {statusEnvio}
            </div>
          )}

          <button 
            type="button" 
            onClick={handleSubmitProduto}
            className="mt-2 bg-shaday-red text-white font-bold text-lg py-4 rounded-lg hover:bg-red-700 active:scale-[0.98] transition-all shadow-lg"
          >
            Salvar Produto
          </button>

        </form>
      </div>
    </div>
  )
}