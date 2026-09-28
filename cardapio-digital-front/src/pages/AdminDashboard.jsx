import { useState } from 'react';
import AdminTaxas from '../components/AdminTaxas';
import logoImg from '../assets/logo.png'; 
import AdminPedidos from '../components/AdminPedidos';
import AdminProdutos from '../components/AdminProdutos';
import AdminCategorias from '../components/AdminCategorias';

export default function AdminDashboard() {
  const [abaAtual, setAbaAtual] = useState('taxas');

  return (
    <div className="min-h-screen bg-shaday-bg text-white font-sans flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-shaday-card border-b md:border-b-0 md:border-r border-white/5 p-4 flex flex-col gap-6 shrink-0">
        <div className="flex items-center gap-3 px-2">
          <img src={logoImg} alt="Logo" className="h-10 w-auto object-contain" />
          <span className="font-bold text-lg">Painel Admin</span>
        </div>
        
        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-2 md:pb-0">
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
        </nav>
      </aside>

      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        {abaAtual === 'taxas' && <AdminTaxas />}
        
        {abaAtual === 'pedidos' && <AdminPedidos />} 
        
        {abaAtual === 'produtos' && <AdminProdutos />}

        {abaAtual === 'categorias' && <AdminCategorias />}
      </main>
      
    </div>
  );
}