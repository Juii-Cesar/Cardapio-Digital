import { useState } from 'react';
import logoImg from '../assets/logo.png';
import { useCart } from '../contexts/CartContext';

export default function ProdutoModal({ produto, onClose }) {
  const { addToCart } = useCart();

  const [quantidade, setQuantidade] = useState(1);
  const [ingredientesRemovidos, setIngredientesRemovidos] = useState([]);
  const [observacao, setObservacao] = useState('');

  if (!produto) return null;

  const precoTotal = (Number(produto.preco) * quantidade).toFixed(2).replace('.', ',');

  const toggleIngrediente = (nomeIngrediente) => {
    setIngredientesRemovidos((prev) => 
      prev.includes(nomeIngrediente)
        ? prev.filter(item => item !== nomeIngrediente)
        : [...prev, nomeIngrediente]
    );
  };

  const handleAdicionar = () => {
    const itemCarrinho = {
      ...produto,
      quantidade,
      ingredientesRemovidos,
      observacao,
      precoTotal: Number(produto.preco) * quantidade
    };

    addToCart(itemCarrinho);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 transition-opacity">

      <div className="bg-shaday-bg w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl relative border border-shaday-card animate-slide-up">

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-shaday-red transition-colors"
        >
          ✕
        </button>

        <div className="w-full h-56 bg-shaday-card relative shrink-0">
          <img 
            src={produto.url_img_produto || logoImg} 
            alt={produto.nome} 
            className={`w-full h-full ${produto.url_img_produto ? 'object-cover' : 'object-contain p-8 opacity-50'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-shaday-bg to-transparent"></div>
        </div>

        <div className="p-5 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
          <h2 className="text-2xl font-bold text-white mb-2">{produto.nome}</h2>
          <p className="text-shaday-muted text-sm mb-6 leading-relaxed">
            {produto.descricao}
          </p>

          {produto.ingredientes && produto.ingredientes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white font-medium mb-3 text-sm">Deseja retirar algum ingrediente?</h3>
              <div className="flex flex-wrap gap-2">
                {produto.ingredientes.map((ing) => (
                  <button
                    key={ing.id}
                    onClick={() => toggleIngrediente(ing.nome)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors border ${
                      ingredientesRemovidos.includes(ing.nome)
                        ? 'bg-shaday-red/20 border-shaday-red text-shaday-red line-through'
                        : 'bg-shaday-card border-white/10 text-white hover:border-shaday-red/50'
                    }`}
                  >
                    {ing.nome}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-white font-medium mb-3 text-sm">Alguma observação? (Opcional)</h3>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex: Mandar hashi, sem tarê, etc..."
              className="w-full bg-shaday-card border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red resize-none text-sm placeholder:text-white/20"
              rows="2"
            />
          </div>
        </div>

        <div className="p-4 bg-shaday-card border-t border-white/5 flex gap-4 items-center shrink-0">
          <div className="flex items-center bg-shaday-bg rounded-lg border border-white/10">
            <button 
              onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
              className="w-10 h-12 flex items-center justify-center text-white text-lg hover:text-shaday-red disabled:opacity-50"
              disabled={quantidade <= 1}
            >-</button>
            <span className="w-8 text-center text-white font-medium">{quantidade}</span>
            <button 
              onClick={() => setQuantidade(quantidade + 1)}
              className="w-10 h-12 flex items-center justify-center text-white text-lg hover:text-shaday-red"
            >+</button>
          </div>

          <button 
            onClick={handleAdicionar}
            className="flex-1 bg-shaday-red text-white h-12 rounded-lg font-bold flex items-center justify-between px-4 hover:bg-red-700 active:scale-[0.98] transition-all"
          >
            <span>Adicionar</span>
            <span>R$ {precoTotal}</span>
          </button>
        </div>

      </div>
    </div>
  );
}