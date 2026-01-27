import { OrderCard } from './OrderCard';
import type { Pedido, StatusFunil } from '../../types';
import { STATUS_LABELS } from '../../types';
import { ClipboardList, ChefHat, Truck, CheckCircle } from 'lucide-react';

interface KanbanColumnProps {
    status: StatusFunil;
    pedidos: Pedido[];
    onMoveToNext: (id: number, novoStatus: StatusFunil) => Promise<void>;
    onFinalize: (telefone: string) => Promise<void>;
}

const columnIcons: Record<StatusFunil, React.ComponentType<{ className?: string }>> = {
    anotacao: ClipboardList,
    cozinha: ChefHat,
    entrega: Truck,
    finalizado: CheckCircle,
};

const columnColors: Record<StatusFunil, string> = {
    anotacao: 'text-yellow-500 bg-yellow-500/10',
    cozinha: 'text-blue-500 bg-blue-500/10',
    entrega: 'text-green-500 bg-green-500/10',
    finalizado: 'text-[#f97316] bg-[#f97316]/10',
};

export function KanbanColumn({
    status,
    pedidos,
    onMoveToNext,
    onFinalize,
}: KanbanColumnProps) {
    const Icon = columnIcons[status];
    const pedidosFiltrados = pedidos.filter((p) => p.status_funil === status);

    return (
        <div className="flex flex-col bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl overflow-hidden min-h-[500px]">
            {/* Header da coluna */}
            <div className="flex items-center gap-3 p-4 border-b border-[#2a2a2a]">
                <div className={`p-2 rounded-lg ${columnColors[status]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white">{STATUS_LABELS[status]}</h3>
                <span className="ml-auto bg-[#2a2a2a] text-[#a1a1aa] text-sm font-medium px-2.5 py-1 rounded-full">
                    {pedidosFiltrados.length}
                </span>
            </div>

            {/* Lista de cards */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {pedidosFiltrados.length === 0 ? (
                    <div className="text-center py-8 text-[#a1a1aa] opacity-50">
                        <Icon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhum pedido</p>
                    </div>
                ) : (
                    pedidosFiltrados.map((pedido) => (
                        <OrderCard
                            key={pedido.id}
                            pedido={pedido}
                            onMoveToNext={onMoveToNext}
                            onFinalize={onFinalize}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
