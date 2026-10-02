import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function CartBar() {
  const { cartItems } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) return null;

  const totalItens = cartItems.reduce((acc, item) => acc + item.quantidade, 0);
  const valorTotal = cartItems.reduce((acc, item) => acc + item.precoTotal, 0);
  const lojaAberta = true; 

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up bg-shaday-card border-t border-white/5 shadow-[0_-10px_30px_rgba(0,0,0,0.6)]">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between gap-4">

        <div className="flex flex-col">
          <span className="text-xs text-shaday-muted font-medium mb-0.5">
            Total sem a entrega
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-lg text-white">
              R$ {valorTotal.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-xs text-shaday-muted font-medium">
              / {totalItens} {totalItens === 1 ? 'item' : 'itens'}
            </span>
          </div>
        </div>

        <button 
          onClick={() => !lojaAberta ? toast.error("A loja está fechada no momento.") : navigate('/checkout')}
          disabled={!lojaAberta}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shrink-0 ${
            lojaAberta 
              ? 'bg-shaday-red text-white hover:bg-red-700 active:scale-[0.96]' 
              : 'bg-white/10 text-white/40 cursor-not-allowed'
          }`}
        >
          {lojaAberta ? 'Ver carrinho' : 'Loja Fechada'}
        </button>

      </div>
    </div>
  );
}