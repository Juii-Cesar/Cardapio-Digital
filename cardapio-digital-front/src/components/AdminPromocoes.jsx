import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminPromocoes() {
  const [promocoes, setPromocoes] = useState([]);
  const [produtosDisponiveis, setProdutosDisponiveis] = useState([]);
  const [loading, setLoading] = useState(true);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [imagem, setImagem] = useState(null);
  const [produtosSelecionados, setProdutosSelecionados] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [resPromos, resProdutos] = await Promise.all([
        axios.get('http://localhost:3000/api/promo').catch(() => ({ data: [] })),
        axios.get('http://localhost:3000/api/produtos')
      ]);
      setPromocoes(resPromos.data);
      setProdutosDisponiveis(resProdutos.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckbox = (produtoId) => {
    setProdutosSelecionados(prev => 
      prev.includes(produtoId) 
        ? prev.filter(id => id !== produtoId) 
        : [...prev, produtoId]
    );
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setNome('');
    setDescricao('');
    setPreco('');
    setImagem(null);
    setProdutosSelecionados([]);
    const fileInput = document.getElementById('promo-imagem');
    if (fileInput) fileInput.value = '';
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!nome || !preco) return;

    try {
      const formData = new FormData();
      formData.append('nome', nome);
      formData.append('descricao', descricao);
      formData.append('preco', Number(String(preco).replace(',', '.')));
      
      if (produtosSelecionados.length > 0) {
        formData.append('produtos_ids', JSON.stringify(produtosSelecionados));
      }

      if (imagem) formData.append('imagem', imagem);

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (editandoId) {
        await axios.put(`http://localhost:3000/api/promo/${editandoId}`, formData, config);
      } else {
        await axios.post('http://localhost:3000/api/promo', formData, config);
      }
      
      cancelarEdicao();
      carregarDados();
    } catch (error) {
      console.error("Erro ao salvar promoção:", error);
      alert("Erro ao salvar. Verifique se o backend está pronto.");
    }
  };

  if (loading) return <div className="p-4 text-shaday-muted">A carregar promoções...</div>;

  return (
    <div className="flex flex-col gap-6 w-full">
      
      <div className="bg-shaday-card p-5 md:p-6 rounded-2xl border border-white/5 shadow-sm">
        <h2 className="text-white font-bold text-lg mb-6 border-b border-white/10 pb-3">
          {editandoId ? 'Editar Combo/Promoção' : 'Criar Novo Combo'}
        </h2>
        
        <form onSubmit={handleSalvar} className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm text-shaday-muted mb-1 ml-1">Nome do Combo</label>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Combo Casal Smash" className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red" required />
            </div>
            <div className="w-full md:w-48">
              <label className="block text-sm text-shaday-muted mb-1 ml-1">Preço Total (R$)</label>
              <input type="text" value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="0,00" className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red" required />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 flex flex-col gap-4">
              <div>
                <label className="block text-sm text-shaday-muted mb-1 ml-1">Descrição Comercial</label>
                <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descreva o que vem neste combo incrível..." rows="2" className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red resize-none" />
              </div>
              <div>
                <label className="block text-sm text-shaday-muted mb-1 ml-1">Imagem em Destaque</label>
                <input id="promo-imagem" type="file" accept="image/*" onChange={(e) => setImagem(e.target.files[0])} className="w-full bg-[#121212] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-shaday-red file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white/5 file:text-white hover:file:bg-white/10 transition-all cursor-pointer" />
              </div>
            </div>

            {/* SELEÇÃO DE PRODUTOS ESTILIZADA */}
            <div className="flex-1 bg-[#121212] border border-white/10 rounded-xl p-4 flex flex-col h-56">
              <label className="block text-sm text-shaday-muted mb-3 border-b border-white/5 pb-2 shrink-0">
                Selecione os Produtos deste Combo
              </label>
              
              <div className="flex flex-col gap-2 overflow-y-auto pr-2 flex-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
                {produtosDisponiveis.map(produto => {
                  const isSelected = produtosSelecionados.includes(produto.id);
                  return (
                    <label 
                      key={produto.id} 
                      className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-all ${
                        isSelected 
                          ? 'bg-shaday-red/10 border-shaday-red/40' 
                          : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/5'
                      }`}
                    >
                      {/* Checkbox customizado */}
                      <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                        isSelected ? 'bg-shaday-red border-shaday-red' : 'border-white/20 bg-black/20'
                      }`}>
                        {isSelected && (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      
                      <span className={`text-sm font-medium transition-colors ${isSelected ? 'text-white' : 'text-white/80'}`}>
                        {produto.nome}
                      </span>
                      <span className="text-shaday-muted text-xs ml-auto font-mono">
                        R$ {Number(produto.preco).toFixed(2)}
                      </span>
                    </label>
                  );
                })}
                {produtosDisponiveis.length === 0 && <p className="text-xs text-shaday-muted">Nenhum produto cadastrado no sistema.</p>}
              </div>
            </div>
          </div>

          <div className="flex gap-2 h-[50px] mt-2">
            <button type="submit" disabled={!nome || !preco} className="flex-1 bg-shaday-red text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50">
              {editandoId ? 'Salvar Promoção' : 'Criar Promoção'}
            </button>
            {editandoId && (
              <button type="button" onClick={cancelarEdicao} className="px-8 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-colors">
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-shaday-card rounded-2xl border border-white/5 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h2 className="text-white font-bold text-lg">Promoções Ativas</h2>
        </div>
        
        <div className="flex flex-col">
          {promocoes.length === 0 ? (
            <div className="p-8 text-center text-shaday-muted text-sm">Nenhuma promoção ativa no momento.</div>
          ) : (
            promocoes.map((promo) => (
              <div key={promo.id} className="p-4 border-b border-white/5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                <div className="w-16 h-16 bg-black/40 rounded-lg overflow-hidden shrink-0 border border-white/5">
                  {promo.url_img ? (
                    <img src={promo.url_img} alt={promo.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white/20 text-xs text-center p-1">Sem img</div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    ⭐ {promo.nome}
                  </h3>
                  <p className="text-shaday-muted text-xs line-clamp-1 mt-1">{promo.descricao || promo.descriacao}</p>
                </div>
                
                <div className="font-bold text-shaday-red mr-4">
                  R$ {Number(promo.preco).toFixed(2).replace('.', ',')}
                </div>
                
                <button 
                  onClick={() => alert("A aguardar o backend do Júlio para a rota PUT!")}
                  className="text-xs px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors font-medium border border-white/10"
                >
                  Editar
                </button>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}