import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminTaxas() {
  const [bairros, setBairros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [novoNome, setNovoNome] = useState('');
  const [novaTaxa, setNovaTaxa] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [editNome, setEditNome] = useState('');
  const [editTaxa, setEditTaxa] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3000/api/bairros')
      .then(res => {
        setBairros(res.data);
      })
      .catch(error => console.error("Erro ao carregar bairros:", error))
      .finally(() => setLoading(false));
  }, []);

  const atualizarLista = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/bairros');
      setBairros(res.data);
    } catch (error) {
      console.error("Erro ao atualizar bairros:", error);
    }
  };

  const handleAdicionar = async (e) => {
    e.preventDefault();
    if (!novoNome || novaTaxa === '') return;

    try {
      await axios.post('http://localhost:3000/api/bairros', {
        nome_bairro: novoNome,
        taxa: Number(novaTaxa.replace(',', '.'))
      });
      setNovoNome('');
      setNovaTaxa('');
      atualizarLista();
      toast.success("Área adicionada!");
    } catch (error) {
      console.error("Erro ao adicionar bairro:", error);
      toast.error("Erro ao salvar o bairro.");
    }
  };

  const handleToggleStatus = async (bairro) => {
    try {
      await axios.put(`http://localhost:3000/api/bairros/${bairro.id}`, {
        ativo: !bairro.ativo 
      });
      atualizarLista();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const iniciarEdicao = (bairro) => {
    setEditandoId(bairro.id);
    setEditNome(bairro.nome_bairro);
    setEditTaxa(bairro.taxa);
  };

  const handleSalvarEdicao = async (id) => {
    try {
      await axios.put(`http://localhost:3000/api/bairros/${id}`, {
        nome_bairro: editNome,
        taxa: Number(String(editTaxa).replace(',', '.'))
      });
      setEditandoId(null);
      atualizarLista();
      toast.success("Área adicionada!");
    } catch (error) {
      console.error("Erro ao salvar edição:", error);
    }
  };

  if (loading) return <div className="p-4 text-shaday-muted">A carregar áreas de entrega...</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-shaday-card p-5 rounded-2xl border border-white/5 shadow-sm">
        <h2 className="text-white font-bold text-lg mb-4">Adicionar Nova Área</h2>
        <form onSubmit={handleAdicionar} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm text-shaday-muted mb-1 ml-1">Nome do Bairro</label>
            <input 
              type="text" 
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="Ex: Centro" 
              className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red"
            />
          </div>
          <div className="w-full sm:w-32">
            <label className="block text-sm text-shaday-muted mb-1 ml-1">Taxa (R$)</label>
            <input 
              type="number" 
              step="0.01"
              value={novaTaxa}
              onChange={(e) => setNovaTaxa(e.target.value)}
              placeholder="0,00" 
              className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red"
            />
          </div>
          <button 
            type="submit"
            className="w-full sm:w-auto bg-shaday-red text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors h-[50px]"
            disabled={!novoNome || !novaTaxa}
          >
            Adicionar
          </button>
        </form>
      </div>

      <div className="bg-shaday-card rounded-2xl border border-white/5 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h2 className="text-white font-bold text-lg">Áreas Cadastradas</h2>
        </div>
        
        <div className="flex flex-col">
          {bairros.length === 0 ? (
            <div className="p-5 text-center text-shaday-muted text-sm">Nenhum bairro cadastrado.</div>
          ) : (
            bairros.map((bairro) => (
              <div key={bairro.id} className="p-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                
                {editandoId === bairro.id ? (
                  <div className="flex-1 flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text" 
                      value={editNome}
                      onChange={(e) => setEditNome(e.target.value)}
                      className="flex-1 bg-[#121212] border border-white/20 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-shaday-red"
                    />
                    <input 
                      type="number" 
                      step="0.01"
                      value={editTaxa}
                      onChange={(e) => setEditTaxa(e.target.value)}
                      className="w-24 bg-[#121212] border border-white/20 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-shaday-red"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleSalvarEdicao(bairro.id)} className="px-3 py-2 bg-green-600/20 text-green-500 hover:bg-green-600/40 rounded-lg text-sm font-medium transition-colors">Salvar</button>
                      <button onClick={() => setEditandoId(null)} className="px-3 py-2 bg-white/10 text-white hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col">
                      <span className={`font-medium text-base ${bairro.ativo ? 'text-white' : 'text-white/40 line-through'}`}>
                        {bairro.nome_bairro}
                      </span>
                      <span className="text-sm text-shaday-muted">
                        Taxa: R$ {Number(bairro.taxa).toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleToggleStatus(bairro)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${bairro.ativo ? 'bg-shaday-red' : 'bg-white/20'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${bairro.ativo ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                      
                      <button 
                        onClick={() => iniciarEdicao(bairro)}
                        className="text-sm px-3 py-1.5 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors font-medium border border-white/10"
                      >
                        Editar
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}