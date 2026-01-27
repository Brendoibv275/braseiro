import { useState } from 'react';
import {
    Clock,
    User,
    Phone,
    ChefHat,
    Truck,
    CheckCircle,
    Loader2,
} from 'lucide-react';
import type { Pedido, StatusFunil } from '../../types';

interface OrderCardProps {
    pedido: Pedido;
    onMoveToNext: (id: number, novoStatus: StatusFunil) => Promise<void>;
    onFinalize: (telefone: string) => Promise<void>;
}

export function OrderCard({ pedido, onMoveToNext, onFinalize }: OrderCardProps) {
    const [loading, setLoading] = useState(false);

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
        if (tel.length === 11) {
            return `(${tel.slice(0, 2)}) ${tel.slice(2, 7)}-${tel.slice(7)}`;
        }
        return tel;
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
                    color: 'bg-blue-600 hover:bg-blue-700',
                };
            case 'cozinha':
                return {
                    label: 'Pronto para Entrega',
                    icon: Truck,
                    color: 'bg-green-600 hover:bg-green-700',
                };
            case 'entrega':
                return {
                    label: 'Finalizar Pedido',
                    icon: CheckCircle,
                    color: 'bg-[#FF4500] hover:bg-[#E63E00]',
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

    const actionButton = getActionButton();

    return (
        <div
            className={`bg-[#1a1a1a] border-2 border-[#2a2a2a] rounded-xl p-4 transition-all ${isUrgente ? 'pulse-urgent border-red-500' : ''
                }`}
        >
            {/* Header com tempo */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Clock
                        className={`w-4 h-4 ${isUrgente ? 'text-red-500' : 'text-[#a1a1aa]'
                            }`}
                    />
                    <span
                        className={`text-sm font-medium ${isUrgente ? 'text-red-500' : 'text-[#a1a1aa]'
                            }`}
                    >
                        {formatarTempo(tempoDecorrido)}
                    </span>
                </div>
                {isUrgente && (
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full font-medium">
                        URGENTE
                    </span>
                )}
            </div>

            {/* Info do cliente */}
            <div className="space-y-2 mb-4">
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
            <div className="bg-[#0a0a0a] rounded-lg p-3 mb-4">
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
                    <p className="text-[#FF4500] font-bold mt-2">
                        R$ {pedido.valor_total.toFixed(2).replace('.', ',')}
                    </p>
                )}
            </div>

            {/* Botão de ação */}
            {actionButton && (
                <button
                    onClick={handleAction}
                    disabled={loading}
                    className={`w-full ${actionButton.color} text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50`}
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
    );
}
