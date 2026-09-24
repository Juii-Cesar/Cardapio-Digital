import { useState, useEffect } from 'react';
import axios from 'axios';
import logoImg from '../assets/logo.png'; 
import ProdutoModal from '../components/ProdutoModal';
import CartBar from '../components/CartBar';

export default function ClientHome() {
  const [categorias, setCategorias] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [resCategorias, resProdutos] = await Promise.all([
          axios.get('http://localhost:3000/api/categorias'),
          axios.get('http://localhost:3000/api/produtos')
        ]);
        
        setCategorias(resCategorias.data);
        if (resCategorias.data.length > 0) {
          setCategoriaAtiva(resCategorias.data[0].id);
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

  const produtosFiltrados = produtos.filter(produto => String(produto.id_categoria) === String(categoriaAtiva));

  return (
    <div className="min-h-screen bg-shaday-bg text-shaday-text font-sans mx-auto max-w-md shadow-2xl relative">
      <header className="sticky top-0 z-50 bg-shaday-bg border-b border-shaday-card px-4 py-3 flex items-center justify-between">
        <img 
          src={logoImg} 
          alt="Logo Sushi Shaday" 
          className="h-12 w-auto object-contain"
        />
        <button className="text-sm font-medium text-shaday-red border border-shaday-red px-4 py-1.5 rounded-full hover:bg-shaday-red hover:text-white transition-colors">
          Entrar
        </button>
      </header>

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
          <div className="text-center mt-10">
            <p className="text-shaday-muted text-sm">A carregar cardápio...</p>
          </div>
        ) : produtosFiltrados.length > 0 ? (
          produtosFiltrados.map((produto) => (
            <div 
              key={produto.id} 
              onClick={() => setProdutoSelecionado(produto)}
              className="w-full flex bg-shaday-card rounded-xl p-3 gap-4 shadow-sm border border-white/5 active:scale-[0.98] transition-transform cursor-pointer"
            >
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="font-semibold text-shaday-text text-base truncate mb-1">
                  {produto.nome}
                </h3>
                <p className="text-shaday-muted text-xs line-clamp-2 leading-relaxed pr-2">
                  {produto.descricao}
                </p>
                <span className="font-bold text-shaday-red mt-2">
                  R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                </span>
              </div>
              <img
                src={produto.url_img_produto || logoImg}
                alt={produto.nome}
                className="w-24 h-24 rounded-lg object-cover bg-black/50 shrink-0"
              />
            </div>
          ))
        ) : (
          <div className="text-center mt-10">
            <p className="text-shaday-muted text-sm">
              Nenhum produto cadastrado nesta categoria ainda.
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
      <CartBar />
    </div>
  );
}