import { useState } from 'react';
import {
    Clock,
    User,
    Phone,
    ChefHat,
    Truck,
    CheckCircle,
    Loader2,
    Bot,
    UserCircle,
    Store,
    ImageIcon,
    XCircle,
    Zap,
} from 'lucide-react';
import type { Pedido, StatusFunil } from '../../types';

interface OrderCardProps {
    pedido: Pedido;
    onMoveToNext: (id: number, novoStatus: StatusFunil) => Promise<void>;
    onFinalize: (telefone: string) => Promise<void>;
    onReativarIA: (id: number) => Promise<void>;
    onAceitarPagamento: (id: number) => Promise<void>;
    onCancelar: (pedido: Pedido) => Promise<void>;
}

export function OrderCard({
    pedido,
    onMoveToNext,
    onFinalize,
    onReativarIA,
    onAceitarPagamento,
    onCancelar
}: OrderCardProps) {
    const [loading, setLoading] = useState(false);
    const [loadingIA, setLoadingIA] = useState(false);
    const [loadingPagamento, setLoadingPagamento] = useState(false);
    const [loadingCancelar, setLoadingCancelar] = useState(false);

    // Calcular tempo decorrido em minutos
    const calcularTempoDecorrido = () => {
        const agora = new Date();
        const dataPedido = new Date(pedido.data_pedido);
        const diffMs = agora.getTime() - dataPedido.getTime();
        return Math.floor(diffMs / 60000); // minutos
    };

    const tempoDecorrido = calcularTempoDecorrido();
    const isUrgente = tempoDecorrido > 20;

    const formatarTempo = (minutos: number) => {
        if (minutos < 60) return `${minutos} min`;
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        return `${horas}h ${mins}min`;
    };

    const formatarTelefone = (tel: string) => {
        if (tel === '1') return 'Loja';
        if (tel.length === 11) {
            return `(${tel.slice(0, 2)}) ${tel.slice(2, 7)}-${tel.slice(7)}`;
        }
        return tel;
    };

    // Determinar badge de atendimento baseado no telefone e pausa
    // telefone === '1' = pedido criado na loja (presencial)
    // telefone com número completo = delivery (pode ser IA, humano, ou sem orquestração)
    const getAtendimentoBadge = () => {
        // Se telefone é '1', é pedido da loja (presencial)
        if (pedido.telefone === '1') {
            return {
                icon: Store,
                label: 'Loja',
                bgColor: 'bg-blue-500/20',
                textColor: 'text-blue-400',
                borderColor: 'border-blue-500/30',
            };
        }

        // Delivery - verificar status de orquestração (pausa)
        if (pedido.pausa === 'humano') {
            return {
                icon: UserCircle,
                label: 'Humano',
                bgColor: 'bg-amber-500/20',
                textColor: 'text-amber-400',
                borderColor: 'border-amber-500/30',
            };
        } else if (pedido.pausa === 'ia') {
            return {
                icon: Bot,
                label: 'IA',
                bgColor: 'bg-emerald-500/20',
                textColor: 'text-emerald-400',
                borderColor: 'border-emerald-500/30',
            };
        } else {
            // Delivery sem orquestração definida
            return {
                icon: Truck,
                label: 'Delivery',
                bgColor: 'bg-purple-500/20',
                textColor: 'text-purple-400',
                borderColor: 'border-purple-500/30',
            };
        }
    };

    const getNextStatus = (): StatusFunil | 'finalizado' => {
        switch (pedido.status_funil) {
            case 'anotacao':
                return 'cozinha';
            case 'cozinha':
                return 'entrega';
            case 'entrega':
                return 'finalizado';
            default:
                return 'finalizado';
        }
    };

    const getActionButton = () => {
        switch (pedido.status_funil) {
            case 'anotacao':
                return {
                    label: 'Aceitar Pedido',
                    icon: ChefHat,
                    color: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
                };
            case 'cozinha':
                return {
                    label: 'Pronto para Entrega',
                    icon: Truck,
                    color: 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800',
                };
            case 'entrega':
                return {
                    label: 'Finalizar Pedido',
                    icon: CheckCircle,
                    color: 'bg-gradient-to-r from-[#FF4500] to-[#E63E00] hover:from-[#E63E00] hover:to-[#CC3700]',
                };
            default:
                return null;
        }
    };

    const handleAction = async () => {
        setLoading(true);
        try {
            const nextStatus = getNextStatus();
            if (nextStatus === 'finalizado') {
                await onFinalize(pedido.telefone);
            } else {
                await onMoveToNext(pedido.id, nextStatus);
            }
        } catch (error) {
            console.error('Erro ao processar pedido:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReativarIA = async () => {
        setLoadingIA(true);
        try {
            await onReativarIA(pedido.id);
        } catch (error) {
            console.error('Erro ao reativar IA:', error);
        } finally {
            setLoadingIA(false);
        }
    };

    const handleAceitarPagamento = async () => {
        setLoadingPagamento(true);
        try {
            await onAceitarPagamento(pedido.id);
        } catch (error) {
            console.error('Erro ao aceitar pagamento:', error);
        } finally {
            setLoadingPagamento(false);
        }
    };

    const handleCancelar = async () => {
        setLoadingCancelar(true);
        try {
            await onCancelar(pedido);
        } catch (error) {
            console.error('Erro ao cancelar:', error);
        } finally {
            setLoadingCancelar(false);
        }
    };

    const actionButton = getActionButton();
    const atendimentoBadge = getAtendimentoBadge();
    const temComprovantePendente = pedido.imagem === 'recebido';
    const podeReativarIA = pedido.pausa === 'humano';

    return (
        <div
            className={`bg-gradient-to-b from-[#1a1a1a] to-[#151515] border-2 rounded-xl overflow-hidden transition-all shadow-lg hover:shadow-xl hover:shadow-black/20 ${isUrgente
                ? 'border-red-500/70 animate-pulse'
                : temComprovantePendente
                    ? 'border-amber-500/50'
                    : 'border-[#2a2a2a] hover:border-[#3a3a3a]'
                }`}
        >
            {/* Header com badges */}
            <div className="flex items-center justify-between p-3 bg-[#0a0a0a]/50 border-b border-[#262626]">
                {/* Tempo */}
                <div className="flex items-center gap-2">
                    <Clock
                        className={`w-4 h-4 ${isUrgente ? 'text-red-500' : 'text-[#a1a1aa]'}`}
                    />
                    <span
                        className={`text-sm font-medium ${isUrgente ? 'text-red-500' : 'text-[#a1a1aa]'}`}
                    >
                        {formatarTempo(tempoDecorrido)}
                    </span>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2">
                    {/* Badge de atendimento */}
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${atendimentoBadge.bgColor} ${atendimentoBadge.textColor} ${atendimentoBadge.borderColor}`}>
                        <atendimentoBadge.icon className="w-3 h-3" />
                        {atendimentoBadge.label}
                    </div>

                    {/* Badge urgente */}
                    {isUrgente && (
                        <span className="flex items-center gap-1 text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full font-medium border border-red-500/30">
                            <Zap className="w-3 h-3" />
                            URGENTE
                        </span>
                    )}
                </div>
            </div>

            <div className="p-4 space-y-3">
                {/* Info do cliente */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#FF4500]" />
                        <span className="font-semibold text-white">{pedido.nome_cliente}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#a1a1aa]" />
                        <span className="text-sm text-[#a1a1aa]">
                            {formatarTelefone(pedido.telefone)}
                        </span>
                    </div>
                </div>

                {/* Resumo do pedido */}
                <div className="bg-[#0a0a0a] rounded-lg p-3 border border-[#1f1f1f]">
                    <p className="text-sm text-white leading-relaxed">
                        {pedido.resumo_pedido}
                    </p>
                    {pedido.observacoes && (
                        <div className="mt-2 pt-2 border-t border-[#262626]">
                            <p className="text-xs text-[#FF4500] font-medium mb-1">📝 Observações:</p>
                            <p className="text-sm text-yellow-400">{pedido.observacoes}</p>
                        </div>
                    )}
                    {pedido.valor_total && (
                        <p className="text-[#FF4500] font-bold mt-2 text-lg">
                            R$ {pedido.valor_total.toFixed(2).replace('.', ',')}
                        </p>
                    )}
                </div>

                {/* Seção de Comprovante Pendente */}
                {temComprovantePendente && (
                    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <ImageIcon className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-medium text-amber-400">
                                Comprovante Recebido
                            </span>
                        </div>
                        <p className="text-xs text-amber-300/70 mb-3">
                            Cliente enviou um comprovante de pagamento
                        </p>
                        <button
                            onClick={handleAceitarPagamento}
                            disabled={loadingPagamento}
                            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-amber-500/20"
                        >
                            {loadingPagamento ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Aceitar Pagamento
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Botão Reativar IA */}
                {podeReativarIA && (
                    <button
                        onClick={handleReativarIA}
                        disabled={loadingIA}
                        className="w-full bg-gradient-to-r from-emerald-600/20 to-teal-600/20 hover:from-emerald-600/30 hover:to-teal-600/30 border border-emerald-500/30 text-emerald-400 font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loadingIA ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Bot className="w-4 h-4" />
                                Reativar IA
                            </>
                        )}
                    </button>
                )}

                {/* Botões de ação principais */}
                <div className="flex gap-2">
                    {/* Botão Cancelar */}
                    <button
                        onClick={handleCancelar}
                        disabled={loadingCancelar}
                        className="flex-shrink-0 bg-[#1a1a1a] hover:bg-red-500/20 border border-[#2a2a2a] hover:border-red-500/50 text-[#a1a1aa] hover:text-red-400 font-medium p-2.5 rounded-lg transition-all disabled:opacity-50"
                        title="Cancelar pedido"
                    >
                        {loadingCancelar ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <XCircle className="w-5 h-5" />
                        )}
                    </button>

                    {/* Botão de ação principal */}
                    {actionButton && (
                        <button
                            onClick={handleAction}
                            disabled={loading}
                            className={`flex-1 ${actionButton.color} text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg`}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <actionButton.icon className="w-5 h-5" />
                                    {actionButton.label}
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
