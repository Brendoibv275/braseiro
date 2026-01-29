import { OrderCard } from './OrderCard';
import type { Pedido, StatusFunil } from '../../types';
import { STATUS_LABELS } from '../../types';
import { ClipboardList, ChefHat, Truck, CheckCircle } from 'lucide-react';

interface KanbanColumnProps {
    status: StatusFunil;
    pedidos: Pedido[];
    onMoveToNext: (id: number, novoStatus: StatusFunil) => Promise<void>;
    onFinalize: (telefone: string) => Promise<void>;
    onReativarIA: (id: number) => Promise<void>;
    onAceitarPagamento: (id: number) => Promise<void>;
    onCancelar: (pedido: Pedido) => Promise<void>;
}

const columnIcons: Record<StatusFunil, React.ComponentType<{ className?: string }>> = {
    anotacao: ClipboardList,
    cozinha: ChefHat,
    entrega: Truck,
    finalizado: CheckCircle,
};

const columnColors: Record<StatusFunil, { icon: string; badge: string }> = {
    anotacao: {
        icon: 'text-amber-400 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30',
        badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    },
    cozinha: {
        icon: 'text-blue-400 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30',
        badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    },
    entrega: {
        icon: 'text-emerald-400 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30',
        badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    },
    finalizado: {
        icon: 'text-[#FF4500] bg-gradient-to-br from-[#FF4500]/20 to-orange-500/20 border border-[#FF4500]/30',
        badge: 'bg-[#FF4500]/20 text-[#FF4500] border-[#FF4500]/30'
    },
};

export function KanbanColumn({
    status,
    pedidos,
    onMoveToNext,
    onFinalize,
    onReativarIA,
    onAceitarPagamento,
    onCancelar,
}: KanbanColumnProps) {
    const Icon = columnIcons[status];
    const colors = columnColors[status];
    const pedidosFiltrados = pedidos.filter((p) => p.status_funil === status);

    return (
        <div className="flex flex-col bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a] border border-[#2a2a2a] rounded-xl overflow-hidden min-h-[500px] shadow-xl">
            {/* Header da coluna */}
            <div className="flex items-center gap-3 p-4 border-b border-[#2a2a2a] bg-[#0a0a0a]/50">
                <div className={`p-2.5 rounded-lg ${colors.icon}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-lg">{STATUS_LABELS[status]}</h3>
                <span className={`ml-auto text-sm font-bold px-3 py-1 rounded-full border ${colors.badge}`}>
                    {pedidosFiltrados.length}
                </span>
            </div>

            {/* Lista de cards */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {pedidosFiltrados.length === 0 ? (
                    <div className="text-center py-12 text-[#a1a1aa] opacity-50">
                        <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${colors.icon}`}>
                            <Icon className="w-8 h-8" />
                        </div>
                        <p className="text-sm font-medium">Nenhum pedido</p>
                    </div>
                ) : (
                    pedidosFiltrados.map((pedido) => (
                        <OrderCard
                            key={pedido.id}
                            pedido={pedido}
                            onMoveToNext={onMoveToNext}
                            onFinalize={onFinalize}
                            onReativarIA={onReativarIA}
                            onAceitarPagamento={onAceitarPagamento}
                            onCancelar={onCancelar}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
