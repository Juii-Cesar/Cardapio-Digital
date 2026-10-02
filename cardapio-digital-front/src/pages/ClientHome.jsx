import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import logoImg from '../assets/logo.png'; 
import ProdutoModal from '../components/ProdutoModal';
import CartBar from '../components/CartBar';
import MeusPedidosModal from '../components/MeusPedidosModal';
import AuthModal from '../components/AuthModal';

export default function ClientHome() {
  const [categorias, setCategorias] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [showMeusPedidos, setShowMeusPedidos] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [clienteLogado, setClienteLogado] = useState(null);
  const [lojaAberta, setLojaAberta] = useState(true);

  useEffect(() => {
    const clienteSalvo = localStorage.getItem('cliente');
    if (clienteSalvo) {
      // eslint-disable-next-line
      setClienteLogado(JSON.parse(clienteSalvo));
    }

    async function fetchData() {
      try {
        const [resCategorias, resProdutos, resPromos] = await Promise.all([
          axios.get('http://localhost:3000/api/categorias'),
          axios.get('http://localhost:3000/api/produtos'),
          axios.get('http://localhost:3000/api/promo').catch(() => ({ data: [] }))
        ]);
        
        const promosAtivas = resPromos.data;
        setPromos(promosAtivas);
        
        let categoriasAtuais = resCategorias.data;

        if (promosAtivas.length > 0) {
          categoriasAtuais = [{ id: 'promocoes', nome: 'Promoções' }, ...categoriasAtuais];
        }

        setCategorias(categoriasAtuais);
        
        if (categoriasAtuais.length > 0) {
          setCategoriaAtiva(categoriasAtuais[0].id);
        }
        
        setProdutos(resProdutos.data);
      } catch (error) {
        console.error("Erro ao carregar dados do cardápio:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const isAbaPromo = categoriaAtiva === 'promocoes';
  const itensParaExibir = isAbaPromo 
    ? promos 
    : produtos.filter(produto => String(produto.id_categoria) === String(categoriaAtiva));

  return (
    <div className="min-h-screen bg-shaday-bg text-shaday-text font-sans mx-auto max-w-md shadow-2xl relative">
      <header className="sticky top-0 z-50 bg-shaday-bg border-b border-shaday-card px-4 py-3 flex items-center justify-between">
        <img src={logoImg} alt="Logo Sushi Shaday" className="h-12 w-auto object-contain" />
        
        <div className="flex gap-2 items-center">
          <button 
            onClick={() => setShowMeusPedidos(true)}
            className="text-xs font-bold text-shaday-red bg-shaday-red/10 px-3 py-1.5 rounded-full border border-shaday-red/20 hover:bg-shaday-red hover:text-white transition-colors flex items-center gap-1"
          >
            Pedidos
          </button>

          {clienteLogado ? (
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <span className="text-xs text-white/70">Olá, <b className="text-white">{clienteLogado.nome.split(' ')[0]}</b></span>
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('cliente');
                  setClienteLogado(null);
                  toast.success("Sessão terminada.");
                }}
                className="text-[10px] text-shaday-muted hover:text-shaday-red underline ml-1"
              >
                Sair
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowAuthModal(true)}
              className="text-sm font-medium text-shaday-red border border-shaday-red px-4 py-1.5 rounded-full hover:bg-shaday-red hover:text-white transition-colors"
            >
              Entrar
            </button>
          )}
        </div>
      </header>

      {!lojaAberta && (
        <div className="bg-shaday-red text-white text-center py-2.5 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 z-40 relative shadow-md">
          Estamos fechados no momento. Não é possível realizar pedidos.
        </div>
      )}

      <nav className="sticky top-[72px] z-40 bg-shaday-bg/95 backdrop-blur-sm border-b border-shaday-card shadow-sm">
        <div className="flex gap-3 overflow-x-auto px-4 py-3 [&::-webkit-scrollbar]:hidden">
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.id)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                categoriaAtiva === cat.id
                  ? 'bg-shaday-red text-white shadow-md'
                  : 'bg-shaday-card text-shaday-muted hover:text-white'
              }`}
            >
              {cat.nome}
            </button>
          ))}
        </div>
      </nav>

      <main className="p-4 flex flex-col gap-4 pb-24">
        {loading ? (
          <>
            {[1, 2, 3, 4, 5].map((esqueletoId) => (
              <div key={esqueletoId} className="w-full flex bg-shaday-card rounded-xl p-3 gap-4 shadow-sm border border-white/5">
                <div className="flex-1 flex flex-col justify-center py-1">
                  <div className="h-5 bg-white/10 rounded-md w-3/4 mb-3 animate-pulse"></div>
                  <div className="h-3 bg-white/5 rounded-md w-full mb-2 animate-pulse"></div>
                  <div className="h-3 bg-white/5 rounded-md w-4/5 mb-4 animate-pulse"></div>
                  <div className="h-4 bg-white/10 rounded-md w-1/3 mt-auto animate-pulse"></div>
                </div>
                <div className="w-24 h-24 rounded-lg bg-white/10 shrink-0 animate-pulse"></div>
              </div>
            ))}
          </>

        ) : itensParaExibir.length > 0 ? (
          itensParaExibir.map((item) => (
            <div 
              key={item.id} 
              onClick={() => setProdutoSelecionado(isAbaPromo ? { ...item, isPromo: true } : item)}
              className="w-full flex bg-shaday-card rounded-xl p-3 gap-4 shadow-sm border border-white/5 active:scale-[0.98] transition-transform cursor-pointer relative overflow-hidden hover:border-white/10"
            >
              {isAbaPromo && (
                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
              )}
              
              <div className="flex-1 min-w-0 flex flex-col justify-center pl-1">
                <h3 className="font-semibold text-shaday-text text-base truncate mb-1">
                  {item.nome}
                </h3>

                <p className="text-shaday-muted text-xs line-clamp-2 leading-relaxed pr-2">
                  {item.descricao || item.descriacao} 
                </p>

                {item.ingredientes && item.ingredientes.length > 0 && (
                  <p className="text-white/70 text-sm line-clamp-2 mt-1 pr-2 italic">
                    {item.ingredientes.map(i => i.nome).join(', ')}
                  </p>
                )}

                <span className="font-bold text-shaday-red mt-2">
                  R$ {Number(item.preco).toFixed(2).replace('.', ',')}
                </span>
              </div>
              <img
                src={item.url_img_produto || item.url_img || logoImg}
                alt={item.nome}
                className="w-24 h-24 rounded-lg object-cover bg-black/50 shrink-0"
              />
            </div>
          ))
        ) : (
          <div className="text-center mt-10">
            <p className="text-shaday-muted text-sm">
              Nenhum item cadastrado nesta categoria ainda.
            </p>
          </div>
        )}
      </main>

      {produtoSelecionado && (
        <ProdutoModal 
          produto={produtoSelecionado} 
          onClose={() => setProdutoSelecionado(null)} 
        />
      )}
      
      {showMeusPedidos && (
        <MeusPedidosModal onClose={() => setShowMeusPedidos(false)} />
      )}

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onSuccess={(dadosCliente) => setClienteLogado(dadosCliente)} 
        />
      )}
      
      <CartBar />
    </div>
  );
}