import { useState, type FormEvent } from 'react';
import { Loader2, LogIn, AlertCircle, Flame } from 'lucide-react';

interface LoginPageProps {
    onLogin: (email: string, password: string) => Promise<unknown>;
}

export function LoginPage({ onLogin }: LoginPageProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await onLogin(email, password);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message === 'Invalid login credentials'
                        ? 'Email ou senha incorretos'
                        : err.message
                    : 'Erro ao fazer login'
            );
        } finally {
            setLoading(false);
        }
    };

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

                {/* Card de login */}
                <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 shadow-xl">
                    <h2 className="text-xl font-semibold text-white mb-6 text-center">
                        Entrar no sistema
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Campo de email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-[#a1a1aa] mb-2"
                            >
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

                        {/* Campo de senha */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-[#a1a1aa] mb-2"
                            >
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
                            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        {/* Botão de submit */}
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
                </div>

                {/* Footer */}
                <p className="text-center text-[#52525b] text-sm mt-6">
                    © {new Date().getFullYear()} Braseiro • Todos os direitos reservados
                </p>
            </div>
        </div>
    );
}
