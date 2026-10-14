import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthModal from '../components/AuthModal';

export default function Checkout() {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [bairros, setBairros] = useState([]);
  const [bairroSelecionado, setBairroSelecionado] = useState('');
  const [taxaEntrega, setTaxaEntrega] = useState(0);
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lojaAberta, setLojaAberta] = useState(true);
  const [formaPagamento, setFormaPagamento] = useState(''); 
  const [dadosPix, setDadosPix] = useState({ chave: '', titular: '' });

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/bairros?apenasAtivo=true`)
      .then(response => setBairros(response.data))
      .catch(error => console.error("Erro ao carregar bairros:", error));

    axios.get(`${import.meta.env.VITE_API_URL}/api/loja/config`)
      .then(response => {
        setLojaAberta(response.data.aberta);
        setDadosPix({
          chave: response.data.chave_pix || '',
          titular: response.data.titular_pix || ''
        });
      })
      .catch(error => console.error("Erro ao carregar config da loja:", error));
  }, []);

  const handleBairroChange = (e) => {
    const idBairro = e.target.value;
    setBairroSelecionado(idBairro);
    const bairro = bairros.find(b => String(b.id) === String(idBairro));
    setTaxaEntrega(bairro ? Number(bairro.taxa) : 0);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.precoTotal, 0);
  const totalGeral = subtotal + taxaEntrega;

  const handleAvançarParaPagamento = () => {
    if (!bairroSelecionado || !rua || !numero) {
      toast.error("Por favor, preencha o bairro, rua e número para entrega.");
      return;
    }
    
    if (!formaPagamento) {
      toast.error("Por favor, selecione uma forma de pagamento.");
      return;
    }
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.error("Faça login ou crie uma conta para finalizar.");
      setShowAuthModal(true);
    } else {
      handleFinalizarPedido();
    }
  };

  const handleFinalizarPedido = async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const itensFormatados = cartItems.map(item => {
        const payloadItem = {
          quantidade: item.quantidade,
          observacao: item.observacao || (item.ingredientesRemovidos?.length ? `Sem: ${item.ingredientesRemovidos.join(', ')}` : '')
        };

        if (item.isPromo) {
          payloadItem.id_promo = item.id;
        } else {
          payloadItem.id_produto = item.id;
        }
        return payloadItem;
      });

      const clienteSalvo = JSON.parse(localStorage.getItem('cliente') || '{}');
      const textoPagamento = formaPagamento === 'pix' ? '[PAGAMENTO: PIX]' : '[PAGAMENTO: Cartão na Entrega (Máquina)]';

      const payload = {
        cliente: {
          nome: clienteSalvo.nome || 'Cliente',
          tel: clienteSalvo.tel || '',
          rua,
          numero,
          complemento: complemento || '',
          id_bairro: bairroSelecionado,
          cep: ''
        },
        itens: itensFormatados,
        observacao_geral: textoPagamento
      };

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/api/pedidos`, payload, config);
      
      if (formaPagamento === 'pix') {
        localStorage.setItem('lembretePix', 'true');
      }

      toast.success("Pedido realizado com sucesso!");
      if (clearCart) clearCart();
      navigate('/'); 
      
    } catch (error) {
      console.error("Erro ao finalizar pedido:", error);
      toast.error(error.response?.data?.error || "Erro ao enviar pedido. Verifique se a sua sessão expirou.");
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setShowAuthModal(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-shaday-bg text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-4 text-shaday-red">O seu carrinho está vazio</h2>
        <button onClick={() => navigate('/')} className="bg-shaday-card px-6 py-3 rounded-xl border border-white/10 hover:border-shaday-red transition-colors">
          Voltar ao Cardápio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-shaday-bg text-shaday-text font-sans mx-auto max-w-md shadow-2xl relative pb-52">
      
      <header className="sticky top-0 z-50 bg-shaday-bg border-b border-shaday-card px-4 py-4 flex items-center gap-4">
        <button onClick={() => window.history.back()} className="text-white hover:text-shaday-red transition-colors font-bold text-xl">←</button>
        <h1 className="text-lg font-bold text-white">Finalizar Pedido</h1>
      </header>

      {!lojaAberta && (
        <div className="bg-shaday-red text-white text-center py-2.5 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md">
          Estamos fechados no momento.
        </div>
      )}

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
                    <p className="text-xs text-shaday-red mt-1">Sem: {item.ingredientesRemovidos.join(', ')}</p>
                  )}
                  {item.observacao && (
                    <p className="text-xs text-white/50 italic mt-1 bg-black/20 p-1.5 rounded">"{item.observacao}"</p>
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
                <input type="text" value={rua} onChange={e => setRua(e.target.value)} className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red" placeholder="Nome da rua" />
              </div>
              <div className="w-24 shrink-0">
                <label className="block text-sm text-shaday-muted mb-2 ml-1">Nº</label>
                <input type="text" value={numero} onChange={e => setNumero(e.target.value)} className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red" placeholder="123" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-shaday-muted mb-2 ml-1">Complemento (opcional)</label>
              <input type="text" value={complemento} onChange={e => setComplemento(e.target.value)} className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red" placeholder="Apto 101, Bloco B..." />
            </div>
          </div>
        </section>

        <section className="bg-shaday-card p-4 rounded-xl border border-white/5 shadow-sm">
          <h2 className="text-white font-medium mb-4 border-b border-white/10 pb-2">Forma de Pagamento</h2>
          <div className="flex flex-col gap-3">
            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${formaPagamento === 'pix' ? 'border-green-500 bg-green-500/10' : 'border-white/10 bg-[#121212]'}`}>
              <input type="radio" name="pagamento" value="pix" checked={formaPagamento === 'pix'} onChange={(e) => setFormaPagamento(e.target.value)} className="w-4 h-4 accent-green-500" />
              <div className="flex flex-col">
                <span className="text-white text-sm font-medium">PIX</span>
                <span className="text-shaday-muted text-xs">Pague agora pelo telefone</span>
              </div>
            </label>

            {formaPagamento === 'pix' && dadosPix.chave && (
              <div className="ml-7 p-3 bg-black/40 rounded-lg border border-white/5">
                <p className="text-xs text-shaday-muted mb-1">Chave PIX:</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-green-400 font-mono text-sm break-all">{dadosPix.chave}</span>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      navigator.clipboard.writeText(dadosPix.chave);
                      toast.success("Chave PIX copiada!");
                    }}
                    className="bg-white/10 px-3 py-1.5 rounded text-xs text-white hover:bg-white/20 whitespace-nowrap"
                  >
                    Copiar
                  </button>
                  <div className="mt-3 p-2 bg-shaday-red/10 border border-shaday-red/20 rounded text-center">
                    <p className="text-[11px] text-shaday-red font-medium leading-tight">
                        O pedido só começará a ser preparado após a confirmação do pagamento.
                    </p>
                  </div>
                </div>
                {dadosPix.titular && <p className="text-xs text-shaday-muted mt-2">Titular: {dadosPix.titular}</p>}
              </div>
            )}

            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${formaPagamento === 'maquineta' ? 'border-shaday-red bg-shaday-red/10' : 'border-white/10 bg-[#121212]'}`}>
              <input type="radio" name="pagamento" value="maquineta" checked={formaPagamento === 'maquineta'} onChange={(e) => setFormaPagamento(e.target.value)} className="w-4 h-4 accent-shaday-red" />
              <div className="flex flex-col">
                <span className="text-white text-sm font-medium">Cartão na Entrega</span>
                <span className="text-shaday-muted text-xs">O motoboy leva a máquina</span>
              </div>
            </label>
          </div>
        </section>

      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-shaday-card border-t border-white/5 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.6)]">
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
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 ${
              lojaAberta && bairroSelecionado && rua && numero && formaPagamento && !isSubmitting
                ? 'bg-shaday-red text-white hover:bg-red-700 active:scale-[0.98]' 
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
            disabled={!lojaAberta || !bairroSelecionado || !rua || !numero || !formaPagamento || isSubmitting}
            onClick={() => !lojaAberta ? toast.error("A loja está fechada.") : handleAvançarParaPagamento()}
          >
            {!lojaAberta ? 'Restaurante Fechado' : isSubmitting ? 'Processando...' : 'Confirmar Pedido'}
          </button>
        </div>
      </div>

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            handleFinalizarPedido();
          }} 
        />
      )}
      
    </div>
  );
}