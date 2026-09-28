import { useState } from 'react';

const mockPedidos = [
  {
    id: '1001',
    cliente: 'João Silva',
    bairro: 'Itacuruçá',
    total: 85.50,
    status: 'novo',
    itens: '2x Hambúrguer X-Salada, 1x Coca-Cola',
    hora: '19:45'
  },
  {
    id: '1002',
    cliente: 'Maria Oliveira',
    bairro: 'Muriqui',
    total: 45.00,
    status: 'preparando',
    itens: '1x Smash Burger (Sem cebola)',
    hora: '19:30'
  },
  {
    id: '1003',
    cliente: 'Carlos Souza',
    bairro: 'Centro',
    total: 120.00,
    status: 'entrega',
    itens: '3x Hambúrguer Artesanal, 2x Batata Frita',
    hora: '19:15'
  }
];

const Coluna = ({ titulo, statusFiltro, proximoStatus, corBadge, pedidos, moverPedido }) => {
  const pedidosFiltrados = pedidos.filter(p => p.status === statusFiltro);

  return (
    <div className="flex-1 min-w-[300px] bg-white/[0.02] rounded-2xl p-4 border border-white/5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
        <h3 className="font-bold text-white">{titulo}</h3>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${corBadge}`}>
          {pedidosFiltrados.length}
        </span>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto [&::-webkit-scrollbar]:hidden">
        {pedidosFiltrados.map(pedido => (
          <div key={pedido.id} className="bg-shaday-card p-4 rounded-xl border border-white/5 shadow-sm hover:border-white/10 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <span className="text-shaday-red font-bold text-sm">#{pedido.id}</span>
              <span className="text-shaday-muted text-xs">{pedido.hora}</span>
            </div>
            
            <h4 className="text-white font-medium text-base mb-1">{pedido.cliente}</h4>
            <p className="text-shaday-muted text-xs mb-3 flex items-center gap-1">
              📍 {pedido.bairro}
            </p>
            
            <div className="bg-black/20 p-2 rounded-lg mb-3">
              <p className="text-white/80 text-xs line-clamp-2">{pedido.itens}</p>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="font-bold text-white text-sm">
                R$ {pedido.total.toFixed(2).replace('.', ',')}
              </span>
              
              {proximoStatus && (
                <button 
                  onClick={() => moverPedido(pedido.id, proximoStatus)}
                  className="bg-white/10 hover:bg-shaday-red text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  Avançar ➔
                </button>
              )}
            </div>
          </div>
        ))}
        
        {pedidosFiltrados.length === 0 && (
          <div className="text-center text-shaday-muted text-sm py-8 border-2 border-dashed border-white/5 rounded-xl">
            Nenhum pedido nesta etapa.
          </div>
        )}
      </div>
    </div>
  );
};

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState(mockPedidos);

  const moverPedido = (id, novoStatus) => {
    setPedidos(pedidos.map(p => 
      p.id === id ? { ...p, status: novoStatus } : p
    ));
  };

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestão de Pedidos</h2>
          <p className="text-shaday-muted text-sm mt-1">Acompanhe os pedidos em tempo real.</p>
        </div>
        <button className="bg-shaday-red text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
          <span>↻</span> Atualizar
        </button>
      </div>

      <div className="flex-1 flex flex-row gap-6 overflow-x-auto pb-4 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent">
        <Coluna 
          titulo="Novos Pedidos" 
          statusFiltro="novo" 
          proximoStatus="preparando"
          corBadge="bg-blue-500/20 text-blue-400"
          pedidos={pedidos}
          moverPedido={moverPedido}
        />
        <Coluna 
          titulo="Em Preparação" 
          statusFiltro="preparando" 
          proximoStatus="entrega"
          corBadge="bg-yellow-500/20 text-yellow-400"
          pedidos={pedidos}
          moverPedido={moverPedido}
        />
        <Coluna 
          titulo="Saiu para Entrega" 
          statusFiltro="entrega" 
          proximoStatus="concluido"
          corBadge="bg-orange-500/20 text-orange-400"
          pedidos={pedidos}
          moverPedido={moverPedido}
        />
        <Coluna 
          titulo="Concluídos" 
          statusFiltro="concluido" 
          proximoStatus={null}
          corBadge="bg-green-500/20 text-green-400"
          pedidos={pedidos}
          moverPedido={moverPedido}
        />
      </div>
    </div>
  );
}