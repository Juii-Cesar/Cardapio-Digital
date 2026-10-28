import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import impressoraIcon from '../assets/impressora-com-papel-impresso.svg'; 

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroMobile, setFiltroMobile] = useState('Pendente');
  const [ocultarConcluidos, setOcultarConcluidos] = useState(false);
  const [modalExclusao, setModalExclusao] = useState({ isOpen: false, id: null, nome: '' });

  const quantidadePendentesRef = useRef(0);
  const primeiraCarga = useRef(true);

  const fetchPedidos = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/pedidos`, config);
      
      if (Array.isArray(response.data)) {
        const DOZE_HORAS = 12 * 60 * 60 * 1000;
        const agora = Date.now();
        
        const pedidosFiltrados = response.data.filter(pedido => {
          if (pedido.status === 'Concluido' || pedido.status === 'Cancelado') {
            const dataPedido = new Date(pedido.criado_em.includes('Z') ? pedido.criado_em : `${pedido.criado_em}Z`).getTime();
            return (agora - dataPedido) < DOZE_HORAS;
          }
          return true;
        });

        setPedidos(pedidosFiltrados);

        const pendentesAtuais = pedidosFiltrados.filter(p => p.status && p.status.toLowerCase() === 'pendente').length;
        
        if (!primeiraCarga.current && pendentesAtuais > quantidadePendentesRef.current) {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.play().catch(e => console.log("O navegador bloqueou o áudio automático:", e));
          toast.success("NOVO PEDIDO!", {
            duration: 5000,
            style: { border: '1px solid #ef4444', backgroundColor: '#121212', color: '#fff', fontWeight: 'bold' }
          });
        }
        
        quantidadePendentesRef.current = pendentesAtuais;
        primeiraCarga.current = false;
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
  }, [fetchPedidos]);

  const handleAvancarStatus = async (pedidoAtual) => {
    const fluxoDeStatus = {
      'Pendente': 'Preparando',
      'Preparando': 'Em Rota',
      'Em Rota': 'Concluido'
    };
    const novoStatus = fluxoDeStatus[pedidoAtual.status];
    if (!novoStatus) return; 

    try {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.put(`${import.meta.env.VITE_API_URL}/api/pedidos/${pedidoAtual.id_pedido}/status`, {
        status: novoStatus
      }, config);
      
      setFiltroMobile(novoStatus); 
      fetchPedidos(); 
      toast.success("Status do pedido atualizado!");
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao mover o pedido.");
    }
  };

  const confirmarCancelamento = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${import.meta.env.VITE_API_URL}/api/pedidos/${modalExclusao.id}/status`, { status: 'Cancelado' }, { headers: { Authorization: `Bearer ${token}` } });
      setModalExclusao({ isOpen: false, id: null, nome: '' });
      fetchPedidos();
      toast.success("Pedido cancelado.");
    } catch(e) {
      toast.error("Erro ao cancelar pedido.");
    }
  };

  const handleImprimirPedido = (pedido) => {
    const janelaImpressao = window.open('', '', 'width=400,height=600');
    const conteudoTalao = `
      <html>
        <head>
          <style>
            @page { margin: 0; }
            body { font-family: monospace; width: 280px; margin: 0 auto; padding: 10px; font-size: 13px; color: #000; }
            .center { text-align: center; }
            .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
            .bold { font-weight: bold; }
            .flex-between { display: flex; justify-content: space-between; }
            h2 { font-size: 18px; margin: 0; }
          </style>
        </head>
        <body>
          <div class="center">
            <h2>SUSHI SHADAY</h2>
            <p style="margin:4px 0;">Pedido #${String(pedido.id_pedido).substring(0,6).toUpperCase()}</p>
            <p style="margin:4px 0;">Data: ${new Date(pedido.criado_em.includes('Z') ? pedido.criado_em : `${pedido.criado_em}Z`).toLocaleTimeString('pt-BR')}</p>
          </div>
          <div class="divider"></div>
          <p class="bold" style="margin:4px 0;">CLIENTE: ${pedido.cliente_nome}</p>
          <p style="margin:4px 0;">Tel: ${pedido.cliente_tel}</p>
          <p style="margin:4px 0;">Endereço: ${pedido.rua}, ${pedido.numero}</p>
          ${pedido.complemento ? `<p style="margin:4px 0;">Comp: ${pedido.complemento}</p>` : ''}
          <p style="margin:4px 0;">Bairro: ${pedido.nome_bairro}</p>
          <div class="divider"></div>
          <p class="bold" style="margin:4px 0;">ITENS DO PEDIDO:</p>
          ${pedido.itens.map(item => `
            <div class="flex-between" style="margin: 4px 0;">
              <span>${item.quantidade}x${item.produto_nome || item.promo_nome}</span>
              <span>R$ ${item.preco_unitario}</span>
            </div>
            ${item.observacao ? `<small style="display:block; margin-bottom:4px; font-size: 11px;">Obs: ${item.observacao}</small>` : ''}
          `).join('')}
          <div class="divider"></div>
          ${pedido.observacao_geral ? `
            <p class="bold" style="margin:4px 0;">OBSERVAÇÕES:</p>
            <p style="font-size: 12px; margin:4px 0;">${pedido.observacao_geral}</p>
            <div class="divider"></div>
          ` : ''}
          <div class="flex-between bold" style="font-size: 15px; margin-top: 5px;">
            <span>TOTAL:</span>
            <span>R$ ${Number(pedido.total).toFixed(2).replace('.', ',')}</span>
          </div>
          <div class="center" style="margin-top: 15px;">
            <p style="margin:0;">Obrigado pela preferência!</p>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;
    janelaImpressao.document.write(conteudoTalao);
    janelaImpressao.document.close();
  };

  const renderColuna = (titulo, statusFiltro) => {
    if (statusFiltro === 'Concluido' && ocultarConcluidos) return null;

    let filtrados = pedidos.filter(p => p.status === statusFiltro);
    let ocultos = 0;

    if ((statusFiltro === 'Concluido' || statusFiltro === 'Cancelado') && filtrados.length > 15) {
      ocultos = filtrados.length - 15;
      filtrados = filtrados.slice(0, 15);
    }
    
    return (
      <div className={`flex-1 min-w-[280px] w-full md:w-auto flex-col gap-3 bg-[#121212]/50 rounded-xl p-2 border border-white/5 ${filtroMobile === statusFiltro ? 'flex' : 'hidden md:flex'}`}>
        <div className="flex items-center justify-between p-2 mb-1 border-b border-white/5">
          <h3 className="text-white font-bold text-sm">{titulo}</h3>
          <span className="bg-white/10 text-white text-xs px-2.5 py-1 rounded-full font-bold">
            {pedidos.filter(p => p.status === statusFiltro).length}
          </span>
        </div>
        
        {filtrados.length === 0 ? (
          <div className="border border-white/5 border-dashed rounded-xl p-6 flex items-center justify-center text-center m-2">
             <p className="text-shaday-muted text-xs">Nenhum pedido nesta etapa.</p>
          </div>
        ) : (
          <>
            {filtrados.map(pedido => {
              const isCancelado = statusFiltro === 'Cancelado';
              return (
                <div 
                  key={pedido.id_pedido} 
                  className={`border rounded-xl p-4 shadow-sm flex flex-col gap-3 transition-all animate-slide-up relative overflow-hidden ${
                    isCancelado ? 'bg-[#180a0a] border-shaday-red/20 opacity-70' : 'bg-shaday-card border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start border-b border-white/5 pb-3">
                    <div>
                        <span className="text-shaday-red font-black text-xs tracking-wider">
                          #{String(pedido.id_pedido).substring(0,6).toUpperCase()}
                        </span>
                        <h4 className="text-white font-bold text-base mt-1">{pedido.cliente_nome}</h4>
                        <div className="text-shaday-muted text-xs mt-1 leading-relaxed bg-black/20 p-2 rounded-lg border border-white/5">
                          {pedido.rua ? (
                            <>
                              <span className="text-white/80">{pedido.rua}, {pedido.numero}</span>
                              {pedido.complemento && <span className="text-white/60"> ({pedido.complemento})</span>}
                              <br />
                              <span className="text-shaday-red/80 font-medium">{pedido.nome_bairro}</span>
                            </>
                          ) : (
                            <span>{pedido.nome_bairro} <span className="text-white/30 italic">(Endereço pendente)</span></span>
                          )}
                        </div>
                        <p className="text-white/60 text-xs mt-2 font-mono tracking-wide flex items-center gap-1"> 
                          {pedido.cliente_tel}
                        </p>
                    </div>
                    <span className="text-shaday-muted text-[10px] bg-black/30 px-2 py-1 rounded shrink-0 ml-2">
                        {new Date(pedido.criado_em.includes('Z') ? pedido.criado_em : `${pedido.criado_em}Z`).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-2 py-1">
                    {pedido.itens?.map((item, idx) => (
                      <div key={idx} className="leading-relaxed">
                        <span className="text-white/50 font-bold text-sm">{item.quantidade}x </span>
                        <span className="text-white/90 text-sm font-medium">{item.produto_nome || item.promo_nome}</span>
                        {item.observacao && (
                          <p className="text-shaday-red font-medium text-xs pl-5 mt-0.5 italic bg-shaday-red/5 p-1 rounded inline-block w-full">
                            ↳ {item.observacao}
                          </p>
                        )}
                      </div>
                    ))}
                    
                    {(() => {
                      const isPix = pedido.observacao_geral?.includes('PIX');
                      const isMaquineta = pedido.observacao_geral?.includes('Máquina') || pedido.observacao_geral?.includes('Maquineta');
                      let obsLimpa = pedido.observacao_geral || '';
                      obsLimpa = obsLimpa.replace(/\[PAGAMENTO:.*?\]/g, '').trim();

                      return (
                        <div className="mt-2 flex flex-col gap-2">
                          {(isPix || isMaquineta) && (
                            <div className={`inline-flex w-fit px-3 py-1.5 rounded-lg text-xs font-bold border shadow-sm ${
                              isPix ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            }`}>
                              {isPix ? 'PAGAMENTO: PIX' : 'PAGAMENTO: MÁQUINA'}
                            </div>
                          )}
                          {obsLimpa && (
                            <div className="p-3 bg-black/40 rounded-lg text-sm text-white/90 italic border-l-2 border-shaday-red">
                              "{obsLimpa}"
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  
                  <div className="flex flex-col gap-2 mt-1 pt-3 border-t border-white/5">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-black text-sm">
                        R$ {Number(pedido.total).toFixed(2).replace('.',',')}
                      </span>
                      <button 
                        onClick={() => handleImprimirPedido(pedido)}
                        className="transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded flex items-center justify-center"
                        title="Imprimir Pedido"
                      >
                        <img src={impressoraIcon} alt="Imprimir" className="w-5 h-5 invert opacity-60 hover:opacity-100 transition-opacity" />
                      </button>
                    </div>
                    <div className="flex gap-2 justify-end mt-1">
                      {(!isCancelado && statusFiltro !== 'Concluido') && (
                        <button 
                          onClick={() => setModalExclusao({ isOpen: true, id: pedido.id_pedido, nome: `Pedido #${String(pedido.id_pedido).substring(0,6).toUpperCase()}` })}
                          className="text-[10px] uppercase tracking-wider font-bold text-white/50 border border-white/10 hover:border-shaday-red hover:text-shaday-red px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                      {(!isCancelado && statusFiltro !== 'Concluido') && (
                        <button 
                          onClick={() => handleAvancarStatus(pedido)} 
                          className="text-[10px] uppercase tracking-wider font-bold text-white bg-white/10 hover:bg-shaday-red px-4 py-1.5 rounded-lg transition-colors flex-1 text-center flex justify-center items-center"
                        >
                          Avançar ➔
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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

  const abasMobile = [
    { id: 'Pendente', label: 'Novos' },
    { id: 'Preparando', label: 'Cozinha' },
    { id: 'Em Rota', label: 'Em Rota' },
    { id: 'Concluido', label: 'Concluídos' },
    { id: 'Cancelado', label: 'Cancelados' }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
           <h2 className="text-white font-bold text-2xl">Pedidos</h2>
           <p className="text-shaday-muted text-sm mt-1">Acompanhe os pedidos em tempo real.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setOcultarConcluidos(!ocultarConcluidos)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/5 text-white hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-bold transition-colors border border-white/10"
          >
            {ocultarConcluidos ? 'Mostrar Concluídos' : 'Ocultar Concluídos'}
          </button>
          <button 
            onClick={fetchPedidos} 
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-shaday-red/20 text-shaday-red hover:bg-shaday-red hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors border border-shaday-red/30"
          >
            {loading ? 'A carregar...' : '↻ Atualizar'}
          </button>
        </div>
      </div>
      
      <div className="md:hidden flex overflow-x-auto gap-2 pb-2 mb-4 [&::-webkit-scrollbar]:hidden shrink-0">
        {abasMobile.map(aba => {
          if (aba.id === 'Concluido' && ocultarConcluidos) return null;
          const quantidade = pedidos.filter(p => p.status === aba.id).length;
          return (
            <button
              key={aba.id}
              onClick={() => setFiltroMobile(aba.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-sm font-bold transition-colors border ${
                filtroMobile === aba.id ? 'bg-shaday-red border-shaday-red text-white shadow-md' : 'bg-[#121212] border-white/5 text-shaday-muted hover:bg-white/5'
              }`}
            >
              {aba.label}
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${filtroMobile === aba.id ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50'}`}>
                {quantidade}
              </span>
            </button>
          )
        })}
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 flex-1 items-start [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
         {renderColuna('Novos Pedidos', 'Pendente')}
         {renderColuna('Em Preparação', 'Preparando')}
         {renderColuna('Saiu para Entrega', 'Em Rota')}
         {renderColuna('Concluídos', 'Concluido')}
         {renderColuna('Cancelados', 'Cancelado')}
      </div>

      {modalExclusao.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 w-full max-w-sm flex flex-col items-center text-center shadow-2xl">
            <div className="w-14 h-14 bg-shaday-red/10 rounded-full flex items-center justify-center mb-4 border border-shaday-red/20 text-shaday-red">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Confirmar Cancelamento</h3>
            <p className="text-shaday-muted text-sm mb-6">
              Tem certeza que deseja cancelar o <br/><span className="text-white font-bold">"{modalExclusao.nome}"</span>?
            </p>
            <div className="flex w-full gap-3">
              <button onClick={() => setModalExclusao({ isOpen: false, id: null, nome: '' })} className="flex-1 py-3 rounded-xl font-bold text-white bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                Voltar
              </button>
              <button onClick={confirmarCancelamento} className="flex-1 py-3 rounded-xl font-bold text-white bg-shaday-red hover:bg-red-700 transition-colors shadow-lg shadow-shaday-red/20">
                Cancelar Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}