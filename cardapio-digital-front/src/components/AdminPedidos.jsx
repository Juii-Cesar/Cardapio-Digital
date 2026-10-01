import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPedidos = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/pedidos');
      if (Array.isArray(response.data)) {
        setPedidos(response.data);
      } else {
        setPedidos([]);
      }
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(() => { fetchPedidos(); }, 10000);
    return () => clearInterval(interval); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAvancarStatus = async (pedidoAtual) => {
    const fluxoDeStatus = {
      'Pendente': 'Preparando',
      'Preparando': 'Em Rota',
      'Em Rota': 'Concluido'
    };
    const novoStatus = fluxoDeStatus[pedidoAtual.status];
    if (!novoStatus) return; 

    try {
      await axios.put(`http://localhost:3000/api/pedidos/${pedidoAtual.id_pedido}/status`, {
        status: novoStatus
      });
      fetchPedidos(); 
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao mover o pedido. Verifique se o backend está a rodar.");
    }
  };

  const renderColuna = (titulo, statusFiltro) => {
    let filtrados = pedidos.filter(p => p.status === statusFiltro);
    let ocultos = 0;

    // LIMITADOR DE CONCLUÍDOS: Evita coluna infinita
    if (statusFiltro === 'Concluido' && filtrados.length > 15) {
      ocultos = filtrados.length - 15;
      filtrados = filtrados.slice(0, 15);
    }
    
    return (
      <div className="flex-1 min-w-[280px] flex flex-col gap-3 bg-[#121212]/50 rounded-xl p-2 border border-white/5">
        
        <div className="flex items-center justify-between p-2 mb-1 border-b border-white/5">
          <h3 className="text-white font-bold text-sm">{titulo}</h3>
          <span className="bg-white/10 text-white text-xs px-2.5 py-1 rounded-full font-bold">
            {pedidos.filter(p => p.status === statusFiltro).length} {/* Mostra o total real na bolinha */}
          </span>
        </div>
        
        {filtrados.length === 0 ? (
          <div className="border border-white/5 border-dashed rounded-xl p-6 flex items-center justify-center text-center m-2">
             <p className="text-shaday-muted text-xs">Nenhum pedido nesta etapa.</p>
          </div>
        ) : (
          <>
            {filtrados.map(pedido => (
              <div key={pedido.id_pedido} className="bg-shaday-card border border-white/10 rounded-xl p-4 shadow-sm flex flex-col gap-3 hover:border-white/20 transition-colors animate-slide-up relative overflow-hidden">
                
                <div className="flex justify-between items-start border-b border-white/5 pb-3">
                   <div>
                      <span className="text-shaday-red font-black text-xs tracking-wider">
                        #{String(pedido.id_pedido).substring(0,6).toUpperCase()}
                      </span>
                      {/* AUMENTADO: Nome */}
                      <h4 className="text-white font-bold text-base mt-1">{pedido.cliente_nome}</h4>
                      {/* AUMENTADO: Bairro */}
                      <p className="text-shaday-muted text-sm mt-0.5">{pedido.nome_bairro}</p>
                      {/* AUMENTADO: Telefone */}
                      <p className="text-white/60 text-xs mt-1 font-mono tracking-wide">{pedido.cliente_tel}</p>
                   </div>
                   <span className="text-shaday-muted text-[10px] bg-black/30 px-2 py-1 rounded shrink-0 ml-2">
                      {new Date(pedido.criado_em).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                   </span>
                </div>
                
                <div className="flex flex-col gap-2 py-1">
                   {pedido.itens?.map((item, idx) => (
                     <div key={idx} className="leading-relaxed">
                       {/* AUMENTADO: Itens */}
                       <span className="text-white/50 font-bold text-sm">{item.quantidade}x </span>
                       <span className="text-white/90 text-sm font-medium">{item.produto_nome || item.promo_nome}</span>
                       
                       {/* AUMENTADO E DESTACADO: Observação do item (Ex: Sem tomate) */}
                       {item.observacao && (
                         <p className="text-shaday-red font-medium text-xs pl-5 mt-0.5 italic bg-shaday-red/5 p-1 rounded inline-block w-full">
                           ↳ {item.observacao}
                         </p>
                       )}
                     </div>
                   ))}
                   
                   {/* AUMENTADO: Observação Geral */}
                   {pedido.observacao_geral && (
                     <div className="mt-2 p-3 bg-black/40 rounded-lg text-sm text-white/90 italic border-l-2 border-shaday-red">
                       "{pedido.observacao_geral}"
                     </div>
                   )}
                </div>
                
                <div className="flex justify-between items-center mt-1 pt-3 border-t border-white/5">
                   <span className="text-white font-black text-sm">
                     R$ {Number(pedido.total).toFixed(2).replace('.',',')}
                   </span>
                   
                   {statusFiltro !== 'Concluido' && (
                     <button 
                       onClick={() => handleAvancarStatus(pedido)} 
                       className="text-[10px] uppercase tracking-wider font-bold text-white bg-white/10 hover:bg-shaday-red px-4 py-2 rounded-lg transition-colors flex items-center gap-1"
                     >
                       Avançar ➔
                     </button>
                   )}
                </div>
              </div>
            ))}
            
            {/* Aviso de pedidos ocultos para a coluna de Concluídos */}
            {ocultos > 0 && (
              <div className="text-center py-2 mt-1">
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                  +{ocultos} pedidos antigos ocultos
                </span>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-white font-bold text-2xl">Gestão de Pedidos</h2>
           <p className="text-shaday-muted text-sm mt-1">Acompanhe os pedidos em tempo real.</p>
        </div>
        <button 
          onClick={fetchPedidos} 
          className="flex items-center gap-2 bg-shaday-red/20 text-shaday-red hover:bg-shaday-red hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors border border-shaday-red/30"
        >
          {loading ? 'A carregar...' : '↻ Atualizar Agora'}
        </button>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 flex-1 items-start [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
         {renderColuna('Novos Pedidos', 'Pendente')}
         {renderColuna('Em Preparação', 'Preparando')}
         {renderColuna('Saiu para Entrega', 'Em Rota')}
         {renderColuna('Concluídos', 'Concluido')}
      </div>

    </div>
  );
}