import { useCart } from '../contexts/CartContext';

export default function CartBar() {
  const { cartItems } = useCart();

  if (cartItems.length === 0) return null;

  const totalItens = cartItems.reduce((acc, item) => acc + item.quantidade, 0);
  const valorTotal = cartItems.reduce((acc, item) => acc + item.precoTotal, 0);

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
          className="bg-shaday-red text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-700 active:scale-[0.96] transition-all shrink-0"
          onClick={() => console.log("Abrir tela do carrinho!")} 
        >
          Ver carrinho
        </button>

      </div>
    </div>
  );
}