import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function GerenciarEnderecosModal({ onClose, onUpdate }) {
  const [enderecos, setEnderecos] = useState([]);
  const [bairros, setBairros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const carregarDados = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [resEnderecos, resBairros] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/cliente/enderecos`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/bairros?apenasAtivo=true`)
      ]);
      setEnderecos(resEnderecos.data);
      setBairros(resBairros.data);
    } catch (error) {
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Tem a certeza que quer remover este endereço?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/cliente/enderecos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Endereço removido!");
      carregarDados();
      onUpdate();
    } catch (error) {
      toast.error("Erro ao remover endereço.");
    }
  };

  const startEdit = (end) => {
    setEditingId(end.id);
    setEditForm({
      apelido: end.apelido || '',
      rua: end.rua || '',
      numero: end.numero || '',
      complemento: end.complemento || '',
      id_bairro: end.id_bairro || ''
    });
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/api/cliente/enderecos/${editingId}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Endereço atualizado com sucesso!");
      setEditingId(null);
      carregarDados();
      onUpdate();
    } catch (error) {
      toast.error("Erro ao atualizar endereço.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">
         <div className="p-4 border-b border-white/10 flex justify-between items-center bg-shaday-card">
           <h2 className="text-lg font-bold text-white">Gerir Endereços</h2>
           <button onClick={onClose} className="text-white/50 hover:text-white font-bold text-2xl px-2">&times;</button>
         </div>
         
         <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
            {loading ? (
               <p className="text-center text-white/50 py-6">A carregar...</p>
            ) : enderecos.length === 0 ? (
               <p className="text-center text-white/50 py-6">Nenhum endereço guardado.</p>
            ) : (
               <div className="flex flex-col gap-4">
                 {enderecos.map(end => (
                   <div key={end.id} className="bg-white/5 border border-white/10 rounded-xl p-4 transition-all">
                     {editingId === end.id ? (
                       <div className="flex flex-col gap-3 animate-slide-up">
                          <input type="text" value={editForm.apelido} onChange={e => setEditForm({...editForm, apelido: e.target.value})} className="bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm" placeholder="Nome (Ex: Casa)" />
                          
                          <select value={editForm.id_bairro} onChange={e => setEditForm({...editForm, id_bairro: e.target.value})} className="bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm">
                            <option value="">Selecione o bairro...</option>
                            {bairros.map(b => <option key={b.id} value={b.id}>{b.nome_bairro}</option>)}
                          </select>

                          <div className="flex gap-2">
                            <input type="text" value={editForm.rua} onChange={e => setEditForm({...editForm, rua: e.target.value})} className="bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm flex-1" placeholder="Rua" />
                            <input type="text" value={editForm.numero} onChange={e => setEditForm({...editForm, numero: e.target.value})} className="bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm w-20" placeholder="Nº" />
                          </div>
                          <input type="text" value={editForm.complemento} onChange={e => setEditForm({...editForm, complemento: e.target.value})} className="bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm" placeholder="Complemento" />
                          
                          <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white/60 hover:bg-white/10">Cancelar</button>
                            <button onClick={handleSaveEdit} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-shaday-red text-white hover:bg-red-600">Salvar</button>
                          </div>
                       </div>
                     ) : (
                       <div className="flex justify-between items-start gap-3">
                          <div>
                            <h4 className="text-white font-bold text-sm mb-1">{end.apelido || 'Endereço Salvo'}</h4>
                            <p className="text-white/60 text-xs">{end.rua}, {end.numero} {end.complemento && `(${end.complemento})`}</p>
                            <p className="text-shaday-red/80 text-xs mt-0.5">{end.nome_bairro}</p>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => startEdit(end)} className="p-2 bg-white/5 hover:bg-white/20 rounded-lg transition-colors border border-white/5" title="Editar">
                               ✏️
                            </button>
                            <button onClick={() => handleDelete(end.id)} className="p-2 bg-white/5 hover:bg-shaday-red/20 rounded-lg transition-colors border border-white/5" title="Remover">
                               🗑️
                            </button>
                          </div>
                       </div>
                     )}
                   </div>
                 ))}
               </div>
            )}
         </div>
      </div>
    </div>
  );
}