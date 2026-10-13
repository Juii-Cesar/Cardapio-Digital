import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AuthModal({ onClose, onSuccess }) {
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState('');
  const [tel, setTel] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [perguntaSecreta, setPerguntaSecreta] = useState('');
  const [respostaSecreta, setRespostaSecreta] = useState('');
  const [perguntaRecuperada, setPerguntaRecuperada] = useState('');
  const [touchStartY, setTouchStartY] = useState(0);
  const handlePhoneChange = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    if (v.length > 10) v = `${v.slice(0, 10)}-${v.slice(10)}`;
    setTel(v);
  };

  const limparTelefone = (telefoneFormatado) => telefoneFormatado.replace(/\D/g, '');
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/api/cliente/login', {
        tel: limparTelefone(tel),
        senha
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('cliente', JSON.stringify(res.data.cliente));
      
      toast.success("Bem-vindo de volta!");
      if (onSuccess) onSuccess(res.data.cliente);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (senha !== confirmaSenha) return toast.error("As senhas não coincidem!");
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:3000/api/cliente/cadastro', {
        nome,
        tel: limparTelefone(tel),
        senha,
        confirmaSenha,
        perguntaSecreta,
        respostaSecreta
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('cliente', JSON.stringify(res.data.user));
      
      toast.success("Conta criada com sucesso!");
      if (onSuccess) onSuccess(res.data.user);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  const handleBuscarPergunta = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/api/cliente/recuperar-pergunta', {
        tel: limparTelefone(tel)
      });
      setPerguntaRecuperada(res.data.pergunta_secreta);
      setView('forgot_reset');
    } catch (error) {
      toast.error(error.response?.data?.error || "Telefone não encontrado.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (senha !== confirmaSenha) return toast.error("As novas senhas não coincidem!");
    setLoading(true);

    try {
      await axios.post('http://localhost:3000/api/cliente/redefinir-senha', {
        tel: limparTelefone(tel),
        respostaSecreta,
        novaSenha: senha,
        confirmaNovaSenha: confirmaSenha
      });
      
      toast.success("Senha alterada com sucesso! Faça login.");
      setSenha(''); setConfirmaSenha(''); setRespostaSecreta('');
      setView('login');
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao redefinir senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fade-in"
    >
      <div
        onTouchStart={(e) => setTouchStartY(e.touches[0].clientY)}
        onTouchEnd={(e) => {
          if (e.changedTouches[0].clientY - touchStartY > 80) onClose();
        }}
        className="bg-shaday-bg w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 pt-8 shadow-2xl relative border border-shaday-card animate-slide-up max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden"
      >
        
        <div className="w-full flex justify-center absolute top-2 left-0 sm:hidden">
          <div className="w-12 h-1.5 bg-white/20 rounded-full"></div>
        </div>
        
        <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-shaday-red transition-colors">
          ✕
        </button>

        {view === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-2">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Bem-vindo</h2>
              <p className="text-shaday-muted text-sm mb-6">Faça login para continuar o seu pedido.</p>
            </div>
            
            <div>
              <label className="block text-sm text-shaday-muted mb-1 ml-1">Telefone (WhatsApp)</label>
              <input type="tel" required value={tel} onChange={handlePhoneChange} placeholder="(00) 00000-0000" className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red" />
            </div>
            
            <div>
              <label className="block text-sm text-shaday-muted mb-1 ml-1">Palavra-passe</label>
              <input type="password" required value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red" />
              <button type="button" onClick={() => { setView('forgot_tel'); setSenha(''); }} className="text-xs text-shaday-red mt-2 ml-1 font-medium hover:underline">Esqueci a minha palavra-passe</button>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-shaday-red text-white py-3.5 rounded-xl font-bold text-base hover:bg-red-700 transition-colors mt-2 disabled:opacity-50">
              {loading ? 'A carregar...' : 'Entrar'}
            </button>

            <p className="text-center text-sm text-shaday-muted mt-4">
              Ainda não tem conta? <button type="button" onClick={() => { setView('register'); setSenha(''); }} className="text-white font-bold hover:text-shaday-red transition-colors">Criar agora</button>
            </p>
          </form>
        )}

        {view === 'register' && (
          <form onSubmit={handleRegister} className="flex flex-col gap-4 mt-2">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Criar Conta</h2>
              <p className="text-shaday-muted text-sm mb-4">Rápido e fácil para fazer os seus pedidos.</p>
            </div>
            
            <div>
              <label className="block text-sm text-shaday-muted mb-1 ml-1">Nome Completo</label>
              <input type="text" required value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: João Silva" className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red" />
            </div>

            <div>
              <label className="block text-sm text-shaday-muted mb-1 ml-1">Telefone (WhatsApp)</label>
              <input type="tel" required value={tel} onChange={handlePhoneChange} placeholder="(00) 00000-0000" className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red" />
            </div>
            
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm text-shaday-muted mb-1 ml-1">Senha</label>
                <input type="password" required value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red" />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-shaday-muted mb-1 ml-1">Confirmar</label>
                <input type="password" required value={confirmaSenha} onChange={e => setConfirmaSenha(e.target.value)} placeholder="••••••••" className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red" />
              </div>
            </div>

            <div className="bg-black/20 p-3 rounded-xl border border-shaday-red/20 mt-2">
              <p className="text-xs text-shaday-muted mb-3 font-medium">Segurança em caso de perda de senha:</p>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-[11px] text-white/50 mb-1 ml-1">Crie uma Pergunta Secreta</label>
                  <input type="text" required value={perguntaSecreta} onChange={e => setPerguntaSecreta(e.target.value)} placeholder="Ex: Qual o nome do meu primeiro cão?" className="w-full bg-[#121212] border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-shaday-red" />
                </div>
                <div>
                  <label className="block text-[11px] text-white/50 mb-1 ml-1">A sua Resposta</label>
                  <input type="text" required value={respostaSecreta} onChange={e => setRespostaSecreta(e.target.value)} placeholder="Ex: Rex" className="w-full bg-[#121212] border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-shaday-red" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-shaday-red text-white py-3.5 rounded-xl font-bold text-base hover:bg-red-700 transition-colors mt-2 disabled:opacity-50">
              {loading ? 'A criar conta...' : 'Concluir Registo'}
            </button>

            <p className="text-center text-sm text-shaday-muted mt-2">
              Já tem conta? <button type="button" onClick={() => setView('login')} className="text-white font-bold hover:text-shaday-red transition-colors">Fazer Login</button>
            </p>
          </form>
        )}

        {view === 'forgot_tel' && (
          <form onSubmit={handleBuscarPergunta} className="flex flex-col gap-4 mt-2">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Recuperar Conta</h2>
              <p className="text-shaday-muted text-sm mb-6">Insira o seu telefone para procurarmos a sua pergunta secreta.</p>
            </div>
            
            <div>
              <label className="block text-sm text-shaday-muted mb-1 ml-1">Telefone da Conta</label>
              <input type="tel" required value={tel} onChange={handlePhoneChange} placeholder="(00) 00000-0000" className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-shaday-red text-white py-3.5 rounded-xl font-bold text-base hover:bg-red-700 transition-colors mt-2 disabled:opacity-50">
              {loading ? 'A procurar...' : 'Continuar'}
            </button>
            <button type="button" onClick={() => setView('login')} className="text-center text-sm text-white/50 hover:text-white mt-2">Voltar ao Login</button>
          </form>
        )}

        {view === 'forgot_reset' && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4 mt-2">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Redefinir Senha</h2>
              <p className="text-shaday-muted text-sm mb-4">Responda à sua pergunta de segurança.</p>
            </div>
            
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-2">
              <p className="text-xs text-shaday-red font-bold uppercase tracking-wider mb-1">Pergunta Secreta:</p>
              <p className="text-white font-medium italic">"{perguntaRecuperada}"</p>
            </div>

            <div>
              <label className="block text-sm text-shaday-muted mb-1 ml-1">A sua Resposta</label>
              <input type="text" required value={respostaSecreta} onChange={e => setRespostaSecreta(e.target.value)} placeholder="A sua resposta secreta" className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red" />
            </div>
            
            <div className="flex gap-3 mt-2">
              <div className="flex-1">
                <label className="block text-sm text-shaday-muted mb-1 ml-1">Nova Senha</label>
                <input type="password" required value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red" />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-shaday-muted mb-1 ml-1">Confirmar</label>
                <input type="password" required value={confirmaSenha} onChange={e => setConfirmaSenha(e.target.value)} placeholder="••••••••" className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-shaday-red" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold text-base hover:bg-green-700 transition-colors mt-4 disabled:opacity-50">
              {loading ? 'A salvar...' : 'Redefinir e Salvar'}
            </button>
            <button type="button" onClick={() => setView('login')} className="text-center text-sm text-white/50 hover:text-white mt-2">Cancelar</button>
          </form>
        )}

      </div>
    </div>
  );
}