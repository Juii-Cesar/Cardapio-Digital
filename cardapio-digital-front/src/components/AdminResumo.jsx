import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import toast from 'react-hot-toast';

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

export default function AdminResumo() {
  const [loading, setLoading] = useState(true);
  const [todosPedidos, setTodosPedidos] = useState([]);
  const [filtroTempo, setFiltroTempo] = useState('7d');
  const [chavePix, setChavePix] = useState('');
  const [titularPix, setTitularPix] = useState('');
  const [salvandoPix, setSalvandoPix] = useState(false);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const resPedidos = await axios.get(`${import.meta.env.VITE_API_URL}/api/pedidos`, config);
        setTodosPedidos(resPedidos.data);

        const resConfig = await axios.get(`${import.meta.env.VITE_API_URL}/api/loja/config`);
        if (resConfig.data) {
          setChavePix(resConfig.data.chave_pix || '');
          setTitularPix(resConfig.data.titular_pix || '');
        }

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  const handleSalvarPix = async (e) => {
    e.preventDefault();
    setSalvandoPix(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${import.meta.env.VITE_API_URL}/api/loja/config`, 
        { chave_pix: chavePix, titular_pix: titularPix }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Dados do PIX atualizados!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar dados do PIX.");
    } finally {
      setSalvandoPix(false);
    }
  };

  const { metricas, dadosGrafico, topProdutos } = useMemo(() => {
    if (!todosPedidos.length) return { metricas: { faturamento: 0, totalPedidos: 0, ticketMedio: 0 }, dadosGrafico: [], topProdutos: [] };

    const hoje = new Date();
    const dataLimite = new Date();
    dataLimite.setHours(0, 0, 0, 0);

    const diasParaGrafico = [];

    if (filtroTempo === '7d') {
      dataLimite.setDate(hoje.getDate() - 6);
      for(let i=6; i>=0; i--) {
        const d = new Date(); d.setDate(hoje.getDate() - i); diasParaGrafico.push(d);
      }
    } else if (filtroTempo === '30d') {
      dataLimite.setDate(hoje.getDate() - 29);
      for(let i=29; i>=0; i--) {
        const d = new Date(); d.setDate(hoje.getDate() - i); diasParaGrafico.push(d);
      }
    } else if (filtroTempo === 'mes') {
      dataLimite.setDate(1);
      const diaAtual = hoje.getDate();
      for(let i=1; i<=diaAtual; i++) {
        const d = new Date(hoje.getFullYear(), hoje.getMonth(), i); diasParaGrafico.push(d);
      }
    }

    const pedidosFiltrados = todosPedidos.filter(p => p.status !== 'Cancelado' && new Date(p.criado_em) >= dataLimite);
    
    const faturamento = pedidosFiltrados.reduce((acc, p) => acc + Number(p.total), 0);
    const totalPedidos = pedidosFiltrados.length;
    const ticketMedio = totalPedidos > 0 ? faturamento / totalPedidos : 0;
    const mapaDias = {};
    
    diasParaGrafico.forEach(d => {
      const formatada = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      mapaDias[formatada] = 0;
    });

    pedidosFiltrados.forEach(p => {
       const dataPedido = new Date(p.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
       if (mapaDias[dataPedido] !== undefined) {
           mapaDias[dataPedido] += Number(p.total);
       }
    });

    const grafico = Object.keys(mapaDias).map(dia => ({ dia, Total: Number(mapaDias[dia].toFixed(2)) }));
    const contagem = {};
    pedidosFiltrados.forEach(p => {
       p.itens?.forEach(item => {
           const nome = item.produto_nome || item.promo_nome;
           if(nome) {
               contagem[nome] = (contagem[nome] || 0) + Number(item.quantidade);
           }
       });
    });

    const top = Object.keys(contagem)
       .map(nome => ({ nome, quantidade: contagem[nome] }))
       .sort((a,b) => b.quantidade - a.quantidade)
       .slice(0, 5);

    return { 
       metricas: { faturamento, totalPedidos, ticketMedio }, 
       dadosGrafico: grafico, 
       topProdutos: top 
    };
  }, [todosPedidos, filtroTempo]);


  if (loading) return (
    <div className="flex flex-col gap-6 w-full animate-pulse">
      <div className="flex justify-between items-end mb-2">
        <div>
          <div className="h-8 bg-white/10 w-48 rounded mb-2"></div>
          <div className="h-4 bg-white/5 w-64 rounded"></div>
        </div>
        <div className="h-10 bg-white/10 w-32 rounded-xl"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-shaday-card border border-white/5 rounded-2xl"></div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-[300px] bg-shaday-card border border-white/5 rounded-2xl lg:col-span-2"></div>
        <div className="h-[300px] bg-shaday-card border border-white/5 rounded-2xl"></div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
        <div>
          <h2 className="text-white font-bold text-2xl">Visão Geral</h2>
          <p className="text-shaday-muted text-sm mt-1">Acompanhe o desempenho do seu negócio.</p>
        </div>
        
        <div className="bg-[#121212] border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3 w-fit shadow-sm">
          <span className="text-shaday-muted text-sm font-medium">Período:</span>
          <div className="relative">
            <select 
              value={filtroTempo}
              onChange={(e) => setFiltroTempo(e.target.value)}
              className="bg-transparent text-white text-sm font-bold focus:outline-none cursor-pointer appearance-none pr-5 z-10 relative"
            >
              <option value="7d" className="bg-[#121212]">Últimos 7 dias</option>
              <option value="30d" className="bg-[#121212]">Últimos 30 dias</option>
              <option value="mes" className="bg-[#121212]">Mês Atual</option>
            </select>

            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-white/50 text-[10px]">
              ▼
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-shaday-card border border-white/5 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <h3 className="text-shaday-muted text-sm font-medium mb-2">Faturamento Total</h3>
          <p className="text-white text-3xl font-black tracking-tight">
            <span className="text-shaday-red text-xl mr-1">R$</span>
            {metricas.faturamento.toFixed(2).replace('.', ',')}
          </p>
        </div>
        
        <div className="bg-shaday-card border border-white/5 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <h3 className="text-shaday-muted text-sm font-medium mb-2">Total de Pedidos</h3>
          <p className="text-white text-3xl font-black tracking-tight">
            {metricas.totalPedidos}
          </p>
        </div>
        
        <div className="bg-shaday-card border border-white/5 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <h3 className="text-shaday-muted text-sm font-medium mb-2">Ticket Médio</h3>
          <p className="text-white text-3xl font-black tracking-tight">
             <span className="text-shaday-red text-xl mr-1">R$</span>
            {metricas.ticketMedio.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-white/40 text-[10px] mt-1">Gasto médio por cliente</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-shaday-card border border-white/5 rounded-2xl p-6 shadow-sm lg:col-span-2">
          <h3 className="text-white font-bold text-lg mb-6 border-b border-white/5 pb-3">
            Faturamento ({filtroTempo === '7d' ? 'Últimos 7 Dias' : filtroTempo === '30d' ? 'Últimos 30 Dias' : 'Mês Atual'})
          </h3>
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
          <h3 className="text-white font-bold text-lg mb-6 border-b border-white/5 pb-3">Ranking ({filtroTempo === '7d' ? '7 Dias' : filtroTempo === '30d' ? '30 Dias' : 'Mês'})</h3>
          
          <div className="flex flex-col gap-4 flex-1">
            {topProdutos.length === 0 ? (
              <p className="text-shaday-muted text-sm text-center mt-10">Nenhuma venda neste período.</p>
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

      <div className="bg-shaday-card border border-white/5 rounded-2xl p-6 shadow-sm">
        <h3 className="text-white font-bold mb-1">Configuração de Pagamento (PIX)</h3>
        <p className="text-shaday-muted text-xs mb-4">Estes dados aparecerão para o cliente copiar na hora de finalizar o pedido.</p>

        <form onSubmit={handleSalvarPix} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs text-shaday-muted mb-1 ml-1">Chave PIX (Telefone, CPF, Email ou Aleatória)</label>
            <input
              type="text"
              value={chavePix}
              onChange={(e) => setChavePix(e.target.value)}
              placeholder="Ex: 21999999999"
              className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red text-sm transition-colors"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs text-shaday-muted mb-1 ml-1">Nome do Titular da Conta</label>
            <input
              type="text"
              value={titularPix}
              onChange={(e) => setTitularPix(e.target.value)}
              placeholder="Ex: Maria da Silva"
              className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red text-sm transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={salvandoPix}
            className="bg-shaday-red hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors whitespace-nowrap disabled:opacity-50 h-[46px]"
          >
            {salvandoPix ? 'A Salvar...' : 'Salvar Dados'}
          </button>
        </form>
      </div>

    </div>
  );
}