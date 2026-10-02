import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';

export default function AdminResumo() {
  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState({
    faturamento: 0,
    totalPedidos: 0,
    ticketMedio: 0,
  });
  const [dadosGrafico, setDadosGrafico] = useState([]);
  const [topProdutos, setTopProdutos] = useState([]);

  useEffect(() => {
    const carregarEstatisticas = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/pedidos');
        const pedidos = response.data;
        const faturamentoTotal = pedidos.reduce((acc, p) => acc + Number(p.total), 0);
        const qtdPedidos = pedidos.length;
        const ticketMed = qtdPedidos > 0 ? faturamentoTotal / qtdPedidos : 0;

        setMetricas({
          faturamento: faturamentoTotal,
          totalPedidos: qtdPedidos,
          ticketMedio: ticketMed
        });

        const ultimos7Dias = {};
        for(let i=6; i>=0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dataFormatada = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            ultimos7Dias[dataFormatada] = 0;
        }

        pedidos.forEach(p => {
            const dataPedido = new Date(p.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            if(ultimos7Dias[dataPedido] !== undefined) {
                ultimos7Dias[dataPedido] += Number(p.total);
            }
        });

        const formatoGrafico = Object.keys(ultimos7Dias).map(data => ({
            dia: data,
            Total: Number(ultimos7Dias[data].toFixed(2))
        }));
        setDadosGrafico(formatoGrafico);

        const contagem = {};
        pedidos.forEach(p => {
            p.itens?.forEach(item => {
                const nome = item.produto_nome || item.promo_nome;
                if(nome) {
                    contagem[nome] = (contagem[nome] || 0) + Number(item.quantidade);
                }
            });
        });

        const top5 = Object.keys(contagem)
            .map(nome => ({ nome, quantidade: contagem[nome] }))
            .sort((a, b) => b.quantidade - a.quantidade)
            .slice(0, 5);
        
        setTopProdutos(top5);

      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarEstatisticas();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#121212] border border-white/10 p-3 rounded-lg shadow-xl">
          <p className="text-white font-bold mb-1">{label}</p>
          <p className="text-shaday-red font-medium">
            R$ {payload[0].value.toFixed(2).replace('.', ',')}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="p-4 text-shaday-muted">Calculando métricas...</div>;

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      
      <div className="mb-2">
        <h2 className="text-white font-bold text-2xl">Visão Geral</h2>
        <p className="text-shaday-muted text-sm mt-1">Acompanhe o desempenho do seu negócio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-shaday-card border border-white/5 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl"></div>
          <h3 className="text-shaday-muted text-sm font-medium mb-2">Faturamento Total</h3>
          <p className="text-white text-3xl font-black tracking-tight">
            <span className="text-shaday-red text-xl mr-1">R$</span>
            {metricas.faturamento.toFixed(2).replace('.', ',')}
          </p>
        </div>
        
        <div className="bg-shaday-card border border-white/5 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl"></div>
          <h3 className="text-shaday-muted text-sm font-medium mb-2">Total de Pedidos</h3>
          <p className="text-white text-3xl font-black tracking-tight">
            {metricas.totalPedidos}
          </p>
        </div>
        
        <div className="bg-shaday-card border border-white/5 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl"></div>
          <h3 className="text-shaday-muted text-sm font-medium mb-2">Ticket Médio</h3>
          <p className="text-white text-3xl font-black tracking-tight">
             <span className="text-shaday-red text-xl mr-1">R$</span>
            {metricas.ticketMedio.toFixed(2).replace('.', ',')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-shaday-card border border-white/5 rounded-2xl p-6 shadow-sm lg:col-span-2">
          <h3 className="text-white font-bold text-lg mb-6 border-b border-white/5 pb-3">Faturamento (Últimos 7 Dias)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosGrafico} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="dia" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$ ${val}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                <Bar dataKey="Total" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-shaday-card border border-white/5 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-white font-bold text-lg mb-6 border-b border-white/5 pb-3">Produtos Mais Vendidos</h3>
          
          <div className="flex flex-col gap-4 flex-1">
            {topProdutos.length === 0 ? (
              <p className="text-shaday-muted text-sm text-center mt-10">Ainda não há vendas registadas.</p>
            ) : (
              topProdutos.map((prod, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-[#121212] p-3 rounded-xl border border-white/5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : idx === 1 ? 'bg-gray-300/20 text-gray-300 border border-gray-300/30' : idx === 2 ? 'bg-orange-700/20 text-orange-500 border border-orange-700/30' : 'bg-white/5 text-white/50 border border-white/10'}`}>
                    {idx + 1}º
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{prod.nome}</p>
                  </div>
                  <div className="font-bold text-shaday-red text-sm shrink-0">
                    {prod.quantidade}x
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}