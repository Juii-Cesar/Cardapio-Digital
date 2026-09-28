import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';

export default function Checkout() {
  const { cartItems } = useCart();
  const [bairros, setBairros] = useState([]);
  const [bairroSelecionado, setBairroSelecionado] = useState('');
  const [taxaEntrega, setTaxaEntrega] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:3000/api/bairros?apenasAtivo=true')
      .then(response => {
        setBairros(response.data);
      })
      .catch(error => console.error("Erro ao carregar bairros:", error));
  }, []);

  const handleBairroChange = (e) => {
    const idBairro = e.target.value;
    setBairroSelecionado(idBairro);
    
    const bairro = bairros.find(b => String(b.id) === String(idBairro));
    setTaxaEntrega(bairro ? Number(bairro.taxa) : 0);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.precoTotal, 0);
  const totalGeral = subtotal + taxaEntrega;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-shaday-bg text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-4 text-shaday-red">O seu carrinho está vazio</h2>
        <button 
          onClick={() => window.history.back()} 
          className="bg-shaday-card px-6 py-3 rounded-xl border border-white/10 hover:border-shaday-red transition-colors"
        >
          Voltar ao Cardápio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-shaday-bg text-shaday-text font-sans mx-auto max-w-md shadow-2xl relative pb-24">
      
      <header className="sticky top-0 z-50 bg-shaday-bg border-b border-shaday-card px-4 py-4 flex items-center gap-4">
        <button onClick={() => window.history.back()} className="text-white hover:text-shaday-red transition-colors font-bold text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold text-white">Finalizar Pedido</h1>
      </header>

      <main className="p-4 flex flex-col gap-6">
        
        <section className="bg-shaday-card p-4 rounded-xl border border-white/5 shadow-sm">
          <h2 className="text-white font-medium mb-4 border-b border-white/10 pb-2">Itens do Pedido</h2>
          <div className="flex flex-col gap-4">
            {cartItems.map((item, index) => (
              <div key={index} className="flex justify-between items-start gap-3">
                <div className="flex text-shaday-muted font-medium w-6 shrink-0">{item.quantidade}x</div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{item.nome}</p>
                  {item.ingredientesRemovidos?.length > 0 && (
                    <p className="text-xs text-shaday-red mt-1">
                      Sem: {item.ingredientesRemovidos.join(', ')}
                    </p>
                  )}
                  {item.observacao && (
                    <p className="text-xs text-white/50 italic mt-1 bg-black/20 p-1.5 rounded">
                      "{item.observacao}"
                    </p>
                  )}
                </div>
                <div className="text-white font-medium text-sm shrink-0">
                  R$ {item.precoTotal.toFixed(2).replace('.', ',')}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-shaday-card p-4 rounded-xl border border-white/5 shadow-sm">
          <h2 className="text-white font-medium mb-4 border-b border-white/10 pb-2">Local de Entrega</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-shaday-muted mb-2 ml-1">Bairro</label>
              <select 
                value={bairroSelecionado}
                onChange={handleBairroChange}
                className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red appearance-none"
              >
                <option value="">Selecione o seu bairro...</option>
                {bairros.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.nome_bairro} (Taxa: R$ {Number(b.taxa).toFixed(2).replace('.', ',')})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm text-shaday-muted mb-2 ml-1">Rua</label>
                <input type="text" className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red" placeholder="Nome da rua" />
              </div>
              <div className="w-24 shrink-0">
                <label className="block text-sm text-shaday-muted mb-2 ml-1">Nº</label>
                <input type="text" className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red" placeholder="123" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-shaday-muted mb-2 ml-1">Complemento (opcional)</label>
              <input type="text" className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red" placeholder="Apto 101, Bloco B..." />
            </div>

          </div>
        </section>

      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-shaday-card border-t border-white/5 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.6)]">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-sm text-shaday-muted mb-2">
            <span>Subtotal</span>
            <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
          </div>
          <div className="flex justify-between text-sm text-shaday-muted mb-3 border-b border-white/5 pb-3">
            <span>Taxa de Entrega</span>
            <span>{taxaEntrega === 0 ? '--' : `R$ ${taxaEntrega.toFixed(2).replace('.', ',')}`}</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-white font-medium">Total a Pagar</span>
            <span className="text-white font-bold text-xl text-shaday-red">
              R$ {totalGeral.toFixed(2).replace('.', ',')}
            </span>
          </div>

          <button 
            className="w-full bg-shaday-red text-white py-3.5 rounded-xl font-bold text-sm hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50"
            disabled={!bairroSelecionado}
            onClick={() => setShowLoginModal(true)}
          >
            Ir para o Pagamento
          </button>
        </div>
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 transition-opacity">
          <div className="bg-shaday-bg w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative border border-shaday-card animate-slide-up">
            
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-shaday-red transition-colors"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-white mb-2 mt-2">Acesse sua conta</h2>
            <p className="text-shaday-muted text-sm mb-6">Faça login para concluir o seu pedido.</p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-shaday-muted mb-1 ml-1">E-mail ou Celular</label>
                <input 
                  type="text" 
                  placeholder="Seu e-mail ou número" 
                  className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red" 
                />
              </div>
              
              <div>
                <label className="block text-sm text-shaday-muted mb-1 ml-1">Senha</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red" 
                />
              </div>

              <button 

                className="w-full bg-shaday-red text-white py-3.5 rounded-xl font-bold text-base hover:bg-red-700 active:scale-[0.98] transition-all mt-4"
              >
                Entrar e Pagar
              </button>
              
              <button className="text-sm text-shaday-muted hover:text-white transition-colors mt-2">
                Ainda não tem conta? <span className="text-shaday-red font-medium">Cadastre-se</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}