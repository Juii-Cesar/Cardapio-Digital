import { useState, useEffect } from 'react';
import axios from 'axios';

export default function MeusPedidosModal({ onClose }) {
  const [meusPedidos, setMeusPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cliente, setCliente] = useState(null);
  const [telefoneLoja, setTelefoneLoja] = useState('');
  const [touchStartY, setTouchStartY] = useState(0);

  useEffect(() => {
    const clienteSalvo = localStorage.getItem('cliente');
    
    if (clienteSalvo) {
      // eslint-disable-next-line
      setCliente(JSON.parse(clienteSalvo));
    } else {
      setLoading(false);
      return;
    }
    
    axios.get(`${import.meta.env.VITE_API_URL}/api/loja/config`)
      .then(res => {
        if (res.data && res.data.whatsapp) {
          const num = res.data.whatsapp.replace(/\D/g, '');
          setTelefoneLoja(num.length <= 11 ? `55${num}` : num);
        }
      })
      .catch(err => console.error("Erro ao buscar whatsapp:", err));

    const fetchMeusPedidos = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/cliente/pedidos`, config);
        
        setMeusPedidos(response.data);
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
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fade-in"
    >
      <div 
        onTouchStart={(e) => setTouchStartY(e.touches[0].clientY)}
        onTouchEnd={(e) => {
          if (e.changedTouches[0].clientY - touchStartY > 80) onClose();
        }}
        className="bg-shaday-bg w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl relative border border-shaday-card flex flex-col h-[85vh] sm:h-[70vh] animate-slide-up"
      >
        
        <div className="w-full flex justify-center absolute top-2 left-0 z-20 sm:hidden">
          <div className="w-12 h-1.5 bg-white/20 rounded-full"></div>
        </div>
        
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
          
          {!cliente ? (
             <div className="text-center mt-10 flex flex-col items-center gap-3">
               <p className="text-white font-medium">Faça login para ver os seus pedidos.</p>
               <button onClick={onClose} className="mt-2 text-shaday-red text-sm hover:underline">Fechar e Entrar</button>
             </div>
          ) : loading ? (
            <p className="text-center text-shaday-muted mt-10">A carregar os seus pedidos...</p>
          ) : meusPedidos.length === 0 ? (
            <div className="text-center mt-10 flex flex-col items-center gap-3">
              <p className="text-shaday-muted text-sm">Ainda não fez nenhum pedido.</p>
            </div>
          ) : (
            meusPedidos.map((pedido) => {
              const statusAtualIndex = getStatusIndex(pedido.status);
              const isConcluido = pedido.status === 'Concluido';
              const isCancelado = pedido.status === 'Cancelado';
              const isPix = pedido.observacao_geral?.includes('PIX');
              const isPendente = pedido.status === 'Pendente';

              let obsLimpa = pedido.observacao_geral || '';
              obsLimpa = obsLimpa.replace(/\[PAGAMENTO:.*?\]/g, '').trim();

              return (
                <div key={pedido.id_pedido} className={`shrink-0 bg-[#121212] border rounded-xl p-5 relative overflow-hidden transition-colors ${isConcluido || isCancelado ? 'border-white/5 opacity-70' : 'border-shaday-red/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]'}`}>
                  
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

                  {isCancelado ? (
                    <div className="mb-4 bg-shaday-red/10 border border-shaday-red/30 rounded-xl p-4 text-center">
                      <p className="text-shaday-red font-bold">Pedido Cancelado</p>
                      <p className="text-white/50 text-xs mt-1">Este pedido foi cancelado pelo restaurante.</p>
                    </div>
                  ) : (
                    <div className="relative mb-2">
                      <div className="absolute left-0 top-3 w-full h-1 bg-white/10 rounded z-0"></div>
                      <div 
                        className="absolute left-0 top-3 h-1 bg-shaday-red rounded z-0 transition-all duration-500 ease-in-out" 
                        style={{ width: `${(statusAtualIndex / 3) * 100}%` }}
                      ></div>

                      <div className="relative z-10 flex justify-between">
                        {['Aprovado', 'Na Cozinha', 'A Caminho', 'Entregue'].map((etapa, idx) => {
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
                  )}

                  {isPix && isPendente && !isCancelado && telefoneLoja && (
                    <div className="mt-4 mb-2 bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-center sm:text-left">
                        <p className="text-sm text-green-400 font-bold mb-0.5">Pagamento via PIX</p>
                        <p className="text-xs text-green-400/80">Envie o comprovante para iniciarmos o preparo.</p>
                      </div>
                      <button
                        onClick={() => {
                          const numPedido = String(pedido.id_pedido).substring(0,6).toUpperCase();
                          const mensagem = `Olá! Acabei de fazer o pedido #${numPedido} e estou enviando o comprovante do PIX no valor de R$ ${Number(pedido.total).toFixed(2).replace('.', ',')}.`;
                          window.open(`https://wa.me/${telefoneLoja}?text=${encodeURIComponent(mensagem)}`, '_blank');
                        }}
                        className="shrink-0 bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors w-full sm:w-auto justify-center shadow-lg shadow-green-900/20"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                        </svg>
                        Enviar Comprovante
                      </button>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-1">
                    <p className="text-xs text-white/50 mb-1 font-medium">Itens pedidos:</p>
                    {pedido.itens?.map((item, idx) => (
                      <span key={idx} className="text-xs text-white/80">
                        <b className="text-white/50">{item.quantidade}x</b> {item.produto_nome || item.promo_nome}
                      </span>
                    ))}
                    {obsLimpa && (
                      <p className="text-xs text-white/50 italic mt-2">Obs: {obsLimpa}</p>
                    )}
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