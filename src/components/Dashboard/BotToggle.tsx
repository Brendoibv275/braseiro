import { Bot, Loader2, Power } from 'lucide-react';
import { useBotConfig } from '../../hooks/useBotConfig';

export function BotToggle() {
    const { botAtivo, loading, updating, error, toggleBot } = useBotConfig();

    if (loading) {
        return (
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 text-[#a1a1aa]">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Carregando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
            <div className="flex items-center justify-between">
                {/* Info do Bot */}
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${botAtivo
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                        <Bot className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white text-sm">
                            Atendimento Automático
                        </h3>
                        <p className={`text-xs font-medium ${botAtivo ? 'text-green-400' : 'text-red-400'
                            }`}>
                            {botAtivo ? 'Ativo' : 'Desativado'}
                        </p>
                    </div>
                </div>

                {/* Toggle Switch */}
                <button
                    onClick={toggleBot}
                    disabled={updating}
                    className={`relative flex items-center justify-center w-14 h-8 rounded-full transition-all duration-300 ${updating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        } ${botAtivo
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-[#3a3a3a] hover:bg-[#4a4a4a]'
                        }`}
                    title={botAtivo ? 'Clique para desativar' : 'Clique para ativar'}
                >
                    {updating ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                        <>
                            <span className={`absolute w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300 ${botAtivo ? 'translate-x-3' : '-translate-x-3'
                                }`}>
                                <Power className={`w-4 h-4 absolute top-1 left-1 ${botAtivo ? 'text-green-500' : 'text-[#3a3a3a]'
                                    }`} />
                            </span>
                        </>
                    )}
                </button>
            </div>

            {/* Mensagem de Erro */}
            {error && (
                <p className="mt-3 text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
                    {error}
                </p>
            )}
        </div>
    );
}
