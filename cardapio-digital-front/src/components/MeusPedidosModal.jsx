import { useState, useEffect } from 'react';
import axios from 'axios';

export default function MeusPedidosModal({ onClose }) {
  const [meusPedidos, setMeusPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const numeroClienteLogado = "21999998888";

  useEffect(() => {
    const fetchMeusPedidos = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/pedidos');
        const filtrados = response.data
          .filter(p => p.cliente_tel === numeroClienteLogado)
          .sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em));
          
        setMeusPedidos(filtrados);
      } catch (error) {
        console.error("Erro ao buscar meus pedidos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeusPedidos();
    
    const interval = setInterval(fetchMeusPedidos, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIndex = (statusBackend) => {
    const etapas = ['Pendente', 'Preparando', 'Em Rota', 'Concluido'];
    return etapas.indexOf(statusBackend);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      
      <div className="bg-shaday-bg w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl relative border border-shaday-card flex flex-col h-[85vh] sm:h-[70vh] animate-slide-up">

        <div className="p-5 border-b border-white/5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">Os Meus Pedidos</h2>
            <p className="text-shaday-muted text-xs mt-1">Acompanhe o status em tempo real</p>
          </div>
          <button 
            onClick={onClose} 
            className="bg-white/5 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-shaday-red transition-colors border border-white/10"
          >
            ✕
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full flex flex-col gap-4">
          
          {loading ? (
            <p className="text-center text-shaday-muted mt-10">A carregar os seus pedidos...</p>
          ) : meusPedidos.length === 0 ? (
            <div className="text-center mt-10 flex flex-col items-center gap-3">
              <p className="text-shaday-muted text-sm">Ainda não fez nenhum pedido.</p>
            </div>
          ) : (
            meusPedidos.map((pedido) => {
              const statusAtualIndex = getStatusIndex(pedido.status);
              const isConcluido = pedido.status === 'Concluido';

              return (
                <div 
                  key={pedido.id_pedido}
                  className={`shrink-0 bg-[#121212] border rounded-xl p-5 relative overflow-hidden transition-colors ${isConcluido ? 'border-white/5 opacity-70' : 'border-shaday-red/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]'}`}
                >

                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-shaday-red font-black text-sm tracking-wider">
                        #{String(pedido.id_pedido).substring(0,6).toUpperCase()}
                      </span>
                      <p className="text-white/60 text-xs mt-1">
                        {new Date(pedido.criado_em).toLocaleDateString()} às {new Date(pedido.criado_em).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                    <span className="text-white font-bold">
                      R$ {Number(pedido.total).toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <div className="relative mb-2">
                    <div className="absolute left-0 top-3 w-full h-1 bg-white/10 rounded z-0"></div>

                    <div 
                      className="absolute left-0 top-3 h-1 bg-shaday-red rounded z-0 transition-all duration-500 ease-in-out" 
                      style={{ width: `${(statusAtualIndex / 3) * 100}%` }}
                    ></div>

                    <div className="relative z-10 flex justify-between">
                      {['Confirmado', 'Em preparo', 'A Caminho', 'Entregue'].map((etapa, idx) => {
                        const isAtiva = statusAtualIndex >= idx;
                        const isAtual = statusAtualIndex === idx;
                        
                        return (
                          <div key={idx} className="flex flex-col items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${isAtiva ? 'bg-shaday-red border-shaday-red text-white' : 'bg-[#121212] border-white/20 text-white/30'} ${isAtual && !isConcluido ? 'ring-4 ring-shaday-red/20 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : ''}`}>
                              {isAtiva ? '✓' : idx + 1}
                            </div>
                            <span className={`text-[10px] sm:text-xs font-medium whitespace-nowrap ${isAtiva ? 'text-white' : 'text-white/40'}`}>
                              {etapa}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-1">
                    <p className="text-xs text-white/50 mb-1 font-medium">Itens pedidos:</p>
                    {pedido.itens?.map((item, idx) => (
                      <span key={idx} className="text-xs text-white/80">
                        <b className="text-white/50">{item.quantidade}x</b> {item.produto_nome || item.promo_nome}
                      </span>
                    ))}
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}