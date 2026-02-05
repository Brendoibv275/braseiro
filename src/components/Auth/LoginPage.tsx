import { useState, type FormEvent } from 'react';
import { Loader2, LogIn, AlertCircle, Flame, UserPlus, CheckCircle, Clock } from 'lucide-react';

interface LoginPageProps {
    onLoginEmail: (email: string, password: string) => Promise<unknown>;
    onLoginGoogle: () => Promise<unknown>;
    onSignUp: (email: string, password: string, nome: string, telefone: string) => Promise<{ success: boolean; message: string }>;
}

type ViewMode = 'login' | 'register' | 'pending';

export function LoginPage({ onLoginEmail, onLoginGoogle, onSignUp }: LoginPageProps) {
    const [mode, setMode] = useState<ViewMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleEmailLogin = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            await onLoginEmail(email, password);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao fazer login';
            // Se for mensagem de aguardando aprovação, mostrar tela de pending
            if (message.includes('pendente') || message.includes('Aguarde')) {
                setMode('pending');
            } else {
                setError(
                    message === 'Invalid login credentials'
                        ? 'Email ou senha incorretos'
                        : message
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            await onLoginGoogle();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao fazer login com Google';
            // Se for mensagem de aguardando aprovação, mostrar tela de pending
            if (message.includes('Aguarde') || message.includes('sucesso') || message.includes('pendente')) {
                setMode('pending');
            } else {
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            const result = await onSignUp(email, password, nome, telefone);
            if (result.success) {
                // Mostrar tela de aguardando aprovação
                setMode('pending');
                // Limpar formulário
                setEmail('');
                setPassword('');
                setNome('');
                setTelefone('');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar conta');
        } finally {
            setLoading(false);
        }
    };

    const resetMessages = () => {
        setError(null);
        setSuccessMessage(null);
    };

    // Tela de aguardando aprovação
    if (mode === 'pending') {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
                <div className="w-full max-w-md text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500/20 rounded-full mb-6">
                        <Clock className="w-10 h-10 text-amber-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-4">Aguardando Aprovação</h1>
                    <p className="text-[#a1a1aa] mb-6">
                        Seu cadastro foi realizado com sucesso! Agora é só aguardar o administrador aprovar seu acesso ao sistema.
                    </p>
                    <div className="bg-[#141414] border border-[#262626] rounded-xl p-4 mb-6">
                        <p className="text-sm text-[#a1a1aa]">
                            Você receberá acesso assim que for aprovado. Tente fazer login novamente depois.
                        </p>
                    </div>
                    <button
                        onClick={() => setMode('login')}
                        className="px-6 py-3 bg-[#FF4500] hover:bg-[#E63E00] text-white font-semibold rounded-lg transition-colors"
                    >
                        Voltar para o Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo e título */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FF4500] to-[#FF6B35] rounded-2xl mb-4 shadow-lg shadow-[#FF4500]/20">
                        <Flame className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Braseiro</h1>
                    <p className="text-[#a1a1aa]">Sistema de Gestão</p>
                </div>

                {/* Card de login/registro */}
                <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 shadow-xl">
                    {/* Tabs */}
                    <div className="flex mb-6 bg-[#0a0a0a] rounded-lg p-1">
                        <button
                            type="button"
                            onClick={() => { setMode('login'); resetMessages(); }}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'login'
                                ? 'bg-[#FF4500] text-white'
                                : 'text-[#a1a1aa] hover:text-white'
                                }`}
                        >
                            Entrar
                        </button>
                        <button
                            type="button"
                            onClick={() => { setMode('register'); resetMessages(); }}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'register'
                                ? 'bg-[#FF4500] text-white'
                                : 'text-[#a1a1aa] hover:text-white'
                                }`}
                        >
                            Cadastrar
                        </button>
                    </div>

                    {mode === 'login' ? (
                        /* Login Form */
                        <>
                            <form onSubmit={handleEmailLogin} className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-[#a1a1aa] mb-2">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="seu@email.com"
                                        required
                                        className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-4 py-3 text-white placeholder:text-[#52525b] focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-colors"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-[#a1a1aa] mb-2">
                                        Senha
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-4 py-3 text-white placeholder:text-[#52525b] focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-colors"
                                    />
                                </div>

                                {/* Mensagem de erro */}
                                {error && (
                                    <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm">{error}</span>
                                    </div>
                                )}

                                {/* Mensagem de sucesso */}
                                {successMessage && (
                                    <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
                                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm">{successMessage}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#FF4500] hover:bg-[#E63E00] disabled:bg-[#FF4500]/50 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Entrando...
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="w-5 h-5" />
                                            Entrar
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Divisor */}
                            <div className="flex items-center gap-3 my-4">
                                <div className="flex-1 h-px bg-[#262626]" />
                                <span className="text-[#52525b] text-sm">ou</span>
                                <div className="flex-1 h-px bg-[#262626]" />
                            </div>

                            {/* Botão Google */}
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-200 text-gray-900 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Continuar com Google
                            </button>
                        </>
                    ) : (
                        /* Register Form */
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div>
                                <label htmlFor="nome" className="block text-sm font-medium text-[#a1a1aa] mb-2">
                                    Nome completo
                                </label>
                                <input
                                    id="nome"
                                    type="text"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    placeholder="Seu nome"
                                    required
                                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-4 py-3 text-white placeholder:text-[#52525b] focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-colors"
                                />
                            </div>

                            <div>
                                <label htmlFor="telefone" className="block text-sm font-medium text-[#a1a1aa] mb-2">
                                    Telefone
                                </label>
                                <input
                                    id="telefone"
                                    type="tel"
                                    value={telefone}
                                    onChange={(e) => setTelefone(e.target.value)}
                                    placeholder="(99) 99999-9999"
                                    required
                                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-4 py-3 text-white placeholder:text-[#52525b] focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-colors"
                                />
                            </div>

                            <div>
                                <label htmlFor="register-email" className="block text-sm font-medium text-[#a1a1aa] mb-2">
                                    Email
                                </label>
                                <input
                                    id="register-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    required
                                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-4 py-3 text-white placeholder:text-[#52525b] focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-colors"
                                />
                            </div>

                            <div>
                                <label htmlFor="register-password" className="block text-sm font-medium text-[#a1a1aa] mb-2">
                                    Senha
                                </label>
                                <input
                                    id="register-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                    minLength={6}
                                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-4 py-3 text-white placeholder:text-[#52525b] focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-colors"
                                />
                            </div>

                            {/* Mensagem de erro */}
                            {error && (
                                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm">{error}</span>
                                </div>
                            )}

                            {/* Mensagem de sucesso */}
                            {successMessage && (
                                <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm">{successMessage}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#FF4500] hover:bg-[#E63E00] disabled:bg-[#FF4500]/50 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Cadastrando...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-5 h-5" />
                                        Solicitar Cadastro
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-[#52525b] text-center">
                                Após o cadastro, aguarde a aprovação do administrador para acessar o sistema.
                            </p>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-[#52525b] text-sm mt-6">
                    © {new Date().getFullYear()} Braseiro • Todos os direitos reservados
                </p>
            </div >
        </div >
    );
}
