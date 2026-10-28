import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import iconeAdmin from '../assets/adm.webp';

export default function AdminLogin() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/login`, {
        email: usuario,
        senha
      });

      localStorage.setItem('adminToken', res.data.token);
      toast.success("Acesso autorizado!");
      navigate('/admin'); 

    } catch (error) {
      console.error("Erro no login:", error);
      toast.error(error.response?.data?.error || "Credenciais inválidas ou servidor offline.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-shaday-bg flex items-center justify-center p-4 relative overflow-hidden">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-shaday-red/5 rounded-full blur-[100px] z-0 pointer-events-none"></div>

      <div className="bg-shaday-card w-full max-w-sm rounded-3xl p-8 shadow-2xl relative z-10 border border-white/5 flex flex-col items-center">
        
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 overflow-hidden bg-white/5 border border-white/10 p-2">
           <img src={iconeAdmin} alt="Ícone Painel" className="w-full h-full object-contain invert opacity-90" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2 text-center">Painel de Gestão</h1>
        <p className="text-shaday-muted text-sm mb-8 text-center">Insira as suas credenciais de administrador.</p>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <div>
            <label className="block text-sm text-shaday-muted mb-1 ml-1">Utilizador</label>
            <input 
              type="text" 
              required
              value={usuario}
              onChange={e => setUsuario(e.target.value)}
              placeholder="admin" 
              className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm text-shaday-muted mb-1 ml-1">Palavra-passe</label>
            <input 
              type="password" 
              required
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red transition-colors"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !usuario || !senha}
            className="w-full bg-shaday-red text-white py-3.5 rounded-xl font-bold hover:bg-red-700 transition-all mt-4 disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? 'A verificar...' : 'Entrar no Sistema'}
          </button>
        </form>

        <button onClick={() => navigate('/')} className="mt-6 text-xs text-white/40 hover:text-white transition-colors">
          ← Voltar ao Cardápio
        </button>

      </div>
    </div>
  );
}