import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminAjustes() {
  const [chavePix, setChavePix] = useState('');
  const [titularPix, setTitularPix] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const resConfig = await axios.get(`${import.meta.env.VITE_API_URL}/api/loja/config`);
        if (resConfig.data) {
          setChavePix(resConfig.data.chave_pix || '');
          setTitularPix(resConfig.data.titular_pix || '');
          setWhatsapp(resConfig.data.whatsapp || '');
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  const handleSalvarConfig = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${import.meta.env.VITE_API_URL}/api/loja/config`, 
        { 
          chave_pix: chavePix, 
          titular_pix: titularPix, 
          whatsapp: whatsapp 
        }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Configurações atualizadas!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar dados.");
    } finally {
      setSalvando(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col gap-6 w-full animate-pulse pb-4">
      <div>
        <div className="h-8 bg-white/10 w-48 rounded-lg mb-2"></div>
        <div className="h-4 bg-white/5 w-80 rounded-lg"></div>
      </div>

      <div className="bg-shaday-card border border-white/5 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <div>
          <div className="h-5 bg-white/10 w-64 rounded-lg mb-2"></div>
          <div className="h-3.5 bg-white/5 w-96 max-w-full rounded-lg"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          <div>
            <div className="h-3 bg-white/5 w-20 rounded mb-2 ml-1"></div>
            <div className="h-11 bg-white/10 rounded-xl w-full"></div>
          </div>
          <div>
            <div className="h-3 bg-white/5 w-20 rounded mb-2 ml-1"></div>
            <div className="h-11 bg-white/10 rounded-xl w-full"></div>
          </div>
          <div>
            <div className="h-3 bg-white/5 w-36 rounded mb-2 ml-1"></div>
            <div className="h-11 bg-white/10 rounded-xl w-full"></div>
          </div>
        </div>

        <div className="h-[46px] bg-white/10 w-32 rounded-xl self-end mt-2"></div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in pb-4">
      <div>
        <h2 className="text-white font-bold text-2xl">Ajustes da Loja</h2>
        <p className="text-shaday-muted text-sm mt-1">Configure os métodos de pagamento, contactos e preferências.</p>
      </div>

      <div className="bg-shaday-card border border-white/5 rounded-2xl p-6 shadow-sm">
        <h3 className="text-white font-bold mb-1">Pagamento (PIX) & WhatsApp</h3>
        <p className="text-shaday-muted text-xs mb-4">Ajuste os dados bancários do PIX e o número de WhatsApp para recebimento de comprovantes.</p>

        <form onSubmit={handleSalvarConfig} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-shaday-muted mb-1 ml-1">Chave PIX</label>
              <input
                type="text"
                value={chavePix}
                onChange={(e) => setChavePix(e.target.value)}
                placeholder="Ex: 21999999999"
                className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-shaday-muted mb-1 ml-1">Nome</label>
              <input
                type="text"
                value={titularPix}
                onChange={(e) => setTitularPix(e.target.value)}
                placeholder="Ex: Maria da Silva"
                className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-shaday-muted mb-1 ml-1">WhatsApp para Comprovantes</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                placeholder="Ex: 21999999999"
                className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red text-sm transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={salvando}
            className="bg-shaday-red hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors self-end disabled:opacity-50 h-[46px] mt-2"
          >
            {salvando ? 'A Salvar...' : 'Salvar'}
          </button>
        </form>
      </div>

    </div>
  );
}