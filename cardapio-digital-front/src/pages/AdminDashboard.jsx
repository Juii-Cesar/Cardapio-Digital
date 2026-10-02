import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminTaxas from '../components/AdminTaxas';
import logoImg from '../assets/logo.png'; 
import AdminPedidos from '../components/AdminPedidos';
import AdminProdutos from '../components/AdminProdutos';
import AdminCategorias from '../components/AdminCategorias';
import AdminPromocoes from '../components/AdminPromocoes';
import AdminResumo from '../components/AdminResumo';

export default function AdminDashboard() {

  const [abaAtual, setAbaAtual] = useState('resumo');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const [lojaAberta, setLojaAberta] = useState(true);
  const handleToggleLoja = () => {
  const novoStatus = !lojaAberta;
  setLojaAberta(novoStatus);
  // await axios.put('http://localhost:3000/api/loja/status', { aberto: novoStatus })
  toast.success(novoStatus ? "A loja está ABERTA!" : "A loja está FECHADA!");
};

  return (
    <div className="min-h-screen bg-shaday-bg text-white font-sans flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-shaday-card border-b md:border-b-0 md:border-r border-white/5 p-4 flex flex-col gap-6 shrink-0">
        <div className="flex items-center gap-3 px-2">
          <img src={logoImg} alt="Logo" className="h-10 w-auto object-contain" />
          <span className="font-bold text-lg">Painel Admin</span>
        </div>
        
        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-2 md:pb-0">
        <div className="mb-6 px-4 py-3 bg-[#121212] rounded-xl border border-white/5 flex items-center justify-between">
          <span className={`text-xs font-bold flex items-center gap-2 ${lojaAberta ? 'text-green-500' : 'text-shaday-red'}`}>
            <div className={`w-2 h-2 rounded-full ${lojaAberta ? 'bg-green-500 animate-pulse' : 'bg-shaday-red'}`}></div>
            {lojaAberta ? 'LOJA ABERTA' : 'LOJA FECHADA'}
          </span>
          <button 
            onClick={handleToggleLoja} 
            className={`w-10 h-5 rounded-full relative transition-colors ${lojaAberta ? 'bg-green-600' : 'bg-white/10'}`}
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
            className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              abaAtual === 'pedidos' 
                ? 'bg-shaday-red text-white shadow-md' 
                : 'text-shaday-muted hover:bg-white/5 hover:text-white'
            }`}
          >
            Gestão de Pedidos
          </button>
          
          <button 
            onClick={() => setAbaAtual('taxas')}
            className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              abaAtual === 'taxas' 
                ? 'bg-shaday-red text-white shadow-md' 
                : 'text-shaday-muted hover:bg-white/5 hover:text-white'
            }`}
          >
            Áreas de Entrega
          </button>

          <button 
            onClick={() => setAbaAtual('categorias')}
            className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              abaAtual === 'categorias' 
                ? 'bg-shaday-red text-white shadow-md' 
                : 'text-shaday-muted hover:bg-white/5 hover:text-white'
            }`}
          >
            Gestão de Categorias
          </button>

          <button 
            onClick={() => setAbaAtual('produtos')}
            className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              abaAtual === 'produtos' 
                ? 'bg-shaday-red text-white shadow-md' 
                : 'text-shaday-muted hover:bg-white/5 hover:text-white'
            }`}
          >
            Cardápio / Produtos
          </button>

          <button 
            onClick={() => setAbaAtual('promocoes')}
            className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              abaAtual === 'promocoes' 
                ? 'bg-shaday-red text-white shadow-md' 
                : 'text-shaday-muted hover:bg-white/5 hover:text-white'
            }`}
          >
            Combos & Promoções
          </button>
        </nav>
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