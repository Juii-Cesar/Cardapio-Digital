import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [novoNome, setNovoNome] = useState('');
  
  useEffect(() => {
    axios.get('http://localhost:3000/api/categorias')
      .then(res => setCategorias(res.data))
      .catch(error => console.error("Erro ao carregar categorias:", error))
      .finally(() => setLoading(false));
  }, []);

  const atualizarLista = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/categorias');
      setCategorias(res.data);
    } catch (error) {
      console.error("Erro ao recarregar categorias:", error);
    }
  };

  const handleAdicionar = async (e) => {
    e.preventDefault();
    if (!novoNome.trim()) return;

    try {
      await axios.post('http://localhost:3000/api/categorias', {
        nome: novoNome
      });
      setNovoNome('');
      atualizarLista();
    } catch (error) {
      console.error("Erro ao adicionar categoria:", error);
      alert("Erro ao salvar. Verifique se a rota POST de categorias já foi criada pelo backend.");
    }
  };

  if (loading) return <div className="p-4 text-shaday-muted">A carregar categorias...</div>;

  return (
    <div className="flex flex-col gap-6 w-full">
      
      <div className="bg-shaday-card p-5 rounded-2xl border border-white/5 shadow-sm">
        <h2 className="text-white font-bold text-lg mb-4 border-b border-white/10 pb-2">Nova Categoria</h2>
        <form onSubmit={handleAdicionar} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm text-shaday-muted mb-1 ml-1">Nome da Categoria</label>
            <input 
              type="text" 
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="Ex: Hambúrgueres Tradicionais" 
              className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red"
            />
          </div>
          <button 
            type="submit"
            className="w-full sm:w-auto bg-shaday-red text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors h-[50px]"
            disabled={!novoNome.trim()}
          >
            Adicionar
          </button>
        </form>
      </div>

      <div className="bg-shaday-card rounded-2xl border border-white/5 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h2 className="text-white font-bold text-lg">Categorias Cadastradas</h2>
        </div>
        
        <div className="flex flex-col">
          {categorias.length === 0 ? (
            <div className="p-5 text-center text-shaday-muted text-sm">Nenhuma categoria cadastrada.</div>
          ) : (
            categorias.map((cat) => (
              <div key={cat.id} className="p-4 border-b border-white/5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <span className="font-medium text-white">{cat.nome}</span>
                
                <button 
                  className="text-sm px-3 py-1.5 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors font-medium border border-white/10"
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