import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [nome, setNome] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarCategorias();
  }, []);

  const carregarCategorias = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/categorias');
      setCategorias(res.data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    } finally {
      setLoading(false);
    }
  };

  const iniciarEdicao = (cat) => {
    setEditandoId(cat.id);
    setNome(cat.nome);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setNome('');
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!nome) return;

    try {
      if (editandoId) {
        await axios.put(`http://localhost:3000/api/categorias/${editandoId}`, { nome });
      } else {
        await axios.post('http://localhost:3000/api/categorias', { nome });
      }
      cancelarEdicao();
      carregarCategorias();
      toast.success(editandoId ? "Categoria atualizada!" : "Categoria criada!");
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      toast.error("Erro ao salvar. Verifique a rota PUT no backend!");
    }
  };

  const handleExcluir = async (id, nomeCategoria) => {
    const confirmar = window.confirm(`Tem a certeza que deseja eliminar a categoria "${nomeCategoria}"?`);
    if (!confirmar) return;

    try {
      await axios.delete(`http://localhost:3000/api/categorias/${id}`);
      carregarCategorias();
      toast.success("Categoria eliminada!");
    } catch (error) {
      console.error("Erro ao eliminar categoria:", error);
      toast.error("Erro ao eliminar. O backend precisa da rota DELETE.");
    }
  };

  if (loading) return <div className="p-4 text-shaday-muted">A carregar categorias...</div>;

  return (
    <div className="flex flex-col gap-6 w-full">
      
      <div className="bg-shaday-card p-5 md:p-6 rounded-2xl border border-white/5 shadow-sm">
        <h2 className="text-white font-bold text-lg mb-6 border-b border-white/10 pb-3">
          {editandoId ? 'Editar Categoria' : 'Nova Categoria'}
        </h2>
        
        <form onSubmit={handleSalvar} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm text-shaday-muted mb-1 ml-1">Nome da Categoria</label>
            <input 
              type="text" 
              value={nome} 
              onChange={(e) => setNome(e.target.value)} 
              placeholder="Ex: Hambúrgueres Tradicionais" 
              className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red" 
              required 
            />
          </div>
          
          <div className="flex gap-2 h-[50px]">
            <button type="submit" disabled={!nome} className="px-6 bg-shaday-red text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50">
              {editandoId ? 'Salvar' : 'Adicionar'}
            </button>
            {editandoId && (
              <button type="button" onClick={cancelarEdicao} className="px-6 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-colors">
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-shaday-card rounded-2xl border border-white/5 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h2 className="text-white font-bold text-lg">Categorias Cadastradas</h2>
        </div>
        
        <div className="flex flex-col">
          {categorias.length === 0 ? (
            <div className="p-8 text-center text-shaday-muted text-sm">Nenhuma categoria cadastrada.</div>
          ) : (
            categorias.map((cat) => (
              <div key={cat.id} className="p-4 border-b border-white/5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <span className="font-medium text-white">{cat.nome}</span>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => iniciarEdicao(cat)}
                    className="text-xs px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors font-medium border border-white/10"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleExcluir(cat.id, cat.nome)}
                    className="p-1.5 bg-white/5 hover:bg-shaday-red text-white/70 hover:text-white rounded transition-colors border border-white/10 flex items-center justify-center"
                    title="Eliminar Categoria"
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
            ))
          )}
        </div>
      </div>

    </div>
  );
}