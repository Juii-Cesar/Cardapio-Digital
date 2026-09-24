import { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (novoItem) => {
    setCartItems((prevItems) => {
      const itemExistenteIndex = prevItems.findIndex(
        item => item.id === novoItem.id && 
                JSON.stringify(item.ingredientesRemovidos) === JSON.stringify(novoItem.ingredientesRemovidos) &&
                item.observacao === novoItem.observacao
      );

      if (itemExistenteIndex >= 0) {
        const novaLista = [...prevItems];
        novaLista[itemExistenteIndex] = {
          ...novaLista[itemExistenteIndex],
          quantidade: novaLista[itemExistenteIndex].quantidade + novoItem.quantidade,
          precoTotal: novaLista[itemExistenteIndex].precoTotal + novoItem.precoTotal
        };
        return novaLista;
      }

      return [...prevItems, novoItem];
    });
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart }}>
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);