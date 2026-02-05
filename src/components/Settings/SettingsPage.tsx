import { useState } from 'react';
import {
    Loader2,
    Users,
    UserCheck,
    UserX,
    Clock,
    User,
    Phone,
    Mail,
    Check,
    X,
    RefreshCw,
} from 'lucide-react';
import { useEmployees } from '../../hooks/useEmployees';
import type { Funcionario } from '../../hooks/useEmployees';
import { QRCodeGenerator } from './QRCodeGenerator';

type ViewTab = 'pendentes' | 'ativos' | 'rejeitados';

export function SettingsPage() {
    const {
        pendentes,
        ativos,
        rejeitados,
        loading,
        error,
        aprovarFuncionario,
        rejeitarFuncionario,
        alterarCargo,
        reativarFuncionario,
    } = useEmployees();

    const [activeView, setActiveView] = useState<ViewTab>('pendentes');
    const [cargoSelecionado, setCargoSelecionado] = useState<Record<string, 'admin' | 'funcionario'>>({});
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const handleAprovar = async (uid: string) => {
        const cargo = cargoSelecionado[uid] || 'funcionario';
        setActionLoading(uid);
        try {
            await aprovarFuncionario(uid, cargo);
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejeitar = async (uid: string) => {
        setActionLoading(uid);
        try {
            await rejeitarFuncionario(uid);
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReativar = async (uid: string) => {
        setActionLoading(uid);
        try {
            await reativarFuncionario(uid);
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleAlterarCargo = async (uid: string, novoCargo: 'admin' | 'funcionario') => {
        setActionLoading(uid);
        try {
            await alterarCargo(uid, novoCargo);
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const renderFuncionarioCard = (funcionario: Funcionario, showActions: boolean = true) => (
        <div
            key={funcionario.uid}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 space-y-3"
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#262626] rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-[#a1a1aa]" />
                    </div>
                    <div>
                        <h4 className="font-medium text-white">{funcionario.nome}</h4>
                        <div className="flex items-center gap-2 text-sm text-[#a1a1aa]">
                            <Mail className="w-3 h-3" />
                            {funcionario.email}
                        </div>
                        {funcionario.telefone && (
                            <div className="flex items-center gap-2 text-sm text-[#a1a1aa]">
                                <Phone className="w-3 h-3" />
                                {funcionario.telefone}
                            </div>
                        )}
                    </div>
                </div>

                {funcionario.cargo && (
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${funcionario.cargo === 'admin'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-blue-500/20 text-blue-400'
                            }`}
                    >
                        {funcionario.cargo === 'admin' ? 'Admin' : 'Funcionário'}
                    </span>
                )}
            </div>

            {showActions && activeView === 'pendentes' && (
                <div className="space-y-3 pt-2 border-t border-[#2a2a2a]">
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-[#a1a1aa]">Cargo:</label>
                        <select
                            value={cargoSelecionado[funcionario.uid] || 'funcionario'}
                            onChange={(e) =>
                                setCargoSelecionado({
                                    ...cargoSelecionado,
                                    [funcionario.uid]: e.target.value as 'admin' | 'funcionario',
                                })
                            }
                            className="flex-1 bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF4500]"
                        >
                            <option value="funcionario">Funcionário</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => handleAprovar(funcionario.uid)}
                            disabled={actionLoading === funcionario.uid}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg transition-colors"
                        >
                            {actionLoading === funcionario.uid ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                            Aprovar
                        </button>
                        <button
                            onClick={() => handleRejeitar(funcionario.uid)}
                            disabled={actionLoading === funcionario.uid}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-lg transition-colors"
                        >
                            {actionLoading === funcionario.uid ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <X className="w-4 h-4" />
                            )}
                            Rejeitar
                        </button>
                    </div>
                </div>
            )}

            {showActions && activeView === 'ativos' && (
                <div className="space-y-3 pt-2 border-t border-[#2a2a2a]">
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-[#a1a1aa]">Alterar cargo:</label>
                        <select
                            value={funcionario.cargo || 'funcionario'}
                            onChange={(e) =>
                                handleAlterarCargo(funcionario.uid, e.target.value as 'admin' | 'funcionario')
                            }
                            disabled={actionLoading === funcionario.uid}
                            className="flex-1 bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF4500]"
                        >
                            <option value="funcionario">Funcionário</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                </div>
            )}

            {showActions && activeView === 'rejeitados' && (
                <div className="pt-2 border-t border-[#2a2a2a]">
                    <button
                        onClick={() => handleReativar(funcionario.uid)}
                        disabled={actionLoading === funcionario.uid}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#FF4500] hover:bg-[#E63E00] disabled:bg-[#FF4500]/50 text-white rounded-lg transition-colors"
                    >
                        {actionLoading === funcionario.uid ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <RefreshCw className="w-4 h-4" />
                        )}
                        Reativar
                    </button>
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-[#FF4500] animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
                <p className="font-medium">Erro ao carregar configurações</p>
                <p className="text-sm opacity-80">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Configurações</h2>

            {/* QR Code do Cardápio */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">QR Code do Cardápio</h3>
                <QRCodeGenerator />
            </div>

            {/* Gestão de Funcionários */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Users className="w-5 h-5 text-[#FF4500]" />
                    <h3 className="text-lg font-semibold text-white">Gestão de Funcionários</h3>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveView('pendentes')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeView === 'pendentes'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-[#262626] text-[#a1a1aa] hover:text-white'
                            }`}
                    >
                        <Clock className="w-4 h-4" />
                        Pendentes ({pendentes.length})
                    </button>
                    <button
                        onClick={() => setActiveView('ativos')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeView === 'ativos'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-[#262626] text-[#a1a1aa] hover:text-white'
                            }`}
                    >
                        <UserCheck className="w-4 h-4" />
                        Ativos ({ativos.length})
                    </button>
                    <button
                        onClick={() => setActiveView('rejeitados')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeView === 'rejeitados'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-[#262626] text-[#a1a1aa] hover:text-white'
                            }`}
                    >
                        <UserX className="w-4 h-4" />
                        Rejeitados ({rejeitados.length})
                    </button>
                </div>

                {/* Lista de Funcionários */}
                <div className="grid gap-4 md:grid-cols-2">
                    {activeView === 'pendentes' && (
                        <>
                            {pendentes.length === 0 ? (
                                <p className="text-[#a1a1aa] col-span-2 text-center py-8">
                                    Nenhum cadastro pendente de aprovação.
                                </p>
                            ) : (
                                pendentes.map((f) => renderFuncionarioCard(f))
                            )}
                        </>
                    )}

                    {activeView === 'ativos' && (
                        <>
                            {ativos.length === 0 ? (
                                <p className="text-[#a1a1aa] col-span-2 text-center py-8">
                                    Nenhum funcionário ativo.
                                </p>
                            ) : (
                                ativos.map((f) => renderFuncionarioCard(f))
                            )}
                        </>
                    )}

                    {activeView === 'rejeitados' && (
                        <>
                            {rejeitados.length === 0 ? (
                                <p className="text-[#a1a1aa] col-span-2 text-center py-8">
                                    Nenhum cadastro rejeitado.
                                </p>
                            ) : (
                                rejeitados.map((f) => renderFuncionarioCard(f))
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
