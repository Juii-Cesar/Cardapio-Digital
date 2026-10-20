import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminTaxas from '../components/AdminTaxas';
import logoImg from '../assets/logo.png'; 
import AdminPedidos from '../components/AdminPedidos';
import AdminProdutos from '../components/AdminProdutos';
import AdminCategorias from '../components/AdminCategorias';
import AdminPromocoes from '../components/AdminPromocoes';
import AdminResumo from '../components/AdminResumo';

export default function AdminDashboard() {

  const [abaAtual, setAbaAtual] = useState('resumo');
  const [lojaAberta, setLojaAberta] = useState(true);
  const [pedidosPendentes, setPedidosPendentes] = useState(0);
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    axios.get(`${import.meta.env.VITE_API_URL}/api/loja/config`)
      .then(res => {
        if (res.data && res.data.aberta !== undefined) {
          setLojaAberta(res.data.aberta);
        }
      })
      .catch(err => console.error("Erro ao buscar status da loja:", err));

    const buscarPedidosPendentes = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/pedidos`, config);
        
        const pendentes = response.data.filter(pedido => pedido.status === 'Pendente').length;
        setPedidosPendentes(pendentes);
      } catch (error) {
        console.error("Erro ao buscar pedidos pendentes:", error);
      }
    };

    buscarPedidosPendentes();
    const interval = setInterval(buscarPedidosPendentes, 10000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleToggleLoja = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const novoStatus = !lojaAberta;

      await axios.put(`${import.meta.env.VITE_API_URL}/api/loja/config`, { aberta: novoStatus }, config);
      
      setLojaAberta(novoStatus);
      toast.success(novoStatus ? "A loja está ABERTA para pedidos!" : "A loja está FECHADA!");
    } catch (error) {
      console.error("Erro ao alterar status da loja:", error);
      toast.error("Erro ao comunicar com o servidor.");
    }
  };

  return (
    <div className="min-h-screen bg-shaday-bg text-white font-sans flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-shaday-card border-b md:border-b-0 md:border-r border-white/5 p-4 flex flex-col gap-6 shrink-0 relative">
        <div className="flex items-center gap-3 px-2">
          <img src={logoImg} alt="Logo" className="h-10 w-auto object-contain" />
          <span className="font-bold text-lg">Gerência da Loja</span>
        </div>
        
        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-2 md:pb-0">
          <div className="shrink-0 mb-0 md:mb-6 px-4 py-3 bg-[#121212] rounded-xl border border-white/5 flex items-center justify-between gap-4">
            <span className={`text-xs font-bold flex items-center gap-2 ${lojaAberta ? 'text-green-500' : 'text-shaday-red'}`}>
              <div className={`w-2 h-2 rounded-full ${lojaAberta ? 'bg-green-500 animate-pulse' : 'bg-shaday-red'}`}></div>
              {lojaAberta ? 'LOJA ABERTA' : 'LOJA FECHADA'}
            </span>
            <button 
              onClick={handleToggleLoja} 
              className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ${lojaAberta ? 'bg-green-600' : 'bg-white/10'}`}
            >
              <div className={`w-3 h-3 rounded-full bg-white absolute top-1 transition-all ${lojaAberta ? 'left-6' : 'left-1'}`}></div>
            </button>
          </div>

          <button 
            onClick={() => setAbaAtual('resumo')}
            className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              abaAtual === 'resumo' 
                ? 'bg-shaday-red text-white shadow-md' 
                : 'text-shaday-muted hover:bg-white/5 hover:text-white'
            }`}
          >
            Visão Geral
          </button>

          <button 
            onClick={() => setAbaAtual('pedidos')}
            className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between whitespace-nowrap ${
              abaAtual === 'pedidos' 
                ? 'bg-shaday-red text-white shadow-md' 
                : 'text-shaday-muted hover:bg-white/5 hover:text-white'
            }`}
          >
            <span>Pedidos</span>
            {pedidosPendentes > 0 && (
              <span className={`flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full ${abaAtual === 'pedidos' ? 'bg-white text-shaday-red' : 'bg-shaday-red text-white'}`}>
                {pedidosPendentes > 99 ? '99+' : pedidosPendentes}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => setAbaAtual('taxas')}
            className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              abaAtual === 'taxas' 
                ? 'bg-shaday-red text-white shadow-md' 
                : 'text-shaday-muted hover:bg-white/5 hover:text-white'
            }`}
          >
            Entrega
          </button>

          <button 
            onClick={() => setAbaAtual('categorias')}
            className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              abaAtual === 'categorias' 
                ? 'bg-shaday-red text-white shadow-md' 
                : 'text-shaday-muted hover:bg-white/5 hover:text-white'
            }`}
          >
            Categorias
          </button>

          <button 
            onClick={() => setAbaAtual('produtos')}
            className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              abaAtual === 'produtos' 
                ? 'bg-shaday-red text-white shadow-md' 
                : 'text-shaday-muted hover:bg-white/5 hover:text-white'
            }`}
          >
            Cardápio
          </button>

          <button 
            onClick={() => setAbaAtual('promocoes')}
            className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              abaAtual === 'promocoes' 
                ? 'bg-shaday-red text-white shadow-md' 
                : 'text-shaday-muted hover:bg-white/5 hover:text-white'
            }`}
          >
            Promoções
          </button>
        </nav>

        <div className="hidden md:block mt-4 pt-4 border-t border-white/5">
        <button 
          onClick={() => window.open('/', '_blank')}
          className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Ver Loja (Cliente)
        </button>
      </div>
      </aside>

      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        {abaAtual === 'taxas' && <AdminTaxas />}
        
        {abaAtual === 'pedidos' && <AdminPedidos />} 
        
        {abaAtual === 'produtos' && <AdminProdutos />}

        {abaAtual === 'categorias' && <AdminCategorias />}

        {abaAtual === 'promocoes' && <AdminPromocoes />}
        
        {abaAtual === 'resumo' && <AdminResumo />}
      </main>
      
    </div>
  );
}