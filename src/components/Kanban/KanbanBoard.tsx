import { useState, useCallback, useEffect } from 'react';
import { Loader2, RefreshCw, CheckCircle, X } from 'lucide-react';
import { KanbanColumn } from './KanbanColumn';
import { useOrders } from '../../hooks/useOrders';
import { useRealtimeOrders } from '../../hooks/useRealtimeOrders';
import type { StatusFunil, Pedido } from '../../types';

export function KanbanBoard() {
    const {
        pedidos: pedidosIniciais,
        loading,
        error,
        atualizarStatus,
        finalizarPedido,
        refetch,
    } = useOrders();

    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [notificacao, setNotificacao] = useState<string | null>(null);

    // Sincronizar pedidos iniciais
    useEffect(() => {
        setPedidos(pedidosIniciais);
    }, [pedidosIniciais]);

    // Callback para atualizações real-time
    const handleRealtimeUpdate = useCallback((novosPedidos: Pedido[]) => {
        setPedidos(novosPedidos);
    }, []);

    // Hook de real-time
    useRealtimeOrders(pedidos, handleRealtimeUpdate);

    const handleMoveToNext = async (id: number, novoStatus: StatusFunil) => {
        try {
            await atualizarStatus(id, novoStatus);
            // Atualizar estado local
            setPedidos((prev) =>
                prev.map((p) => (p.id === id ? { ...p, status_funil: novoStatus } : p))
            );
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    };

    const handleFinalize = async (telefone: string) => {
        try {
            console.log('Iniciando finalização para telefone:', telefone);
            await finalizarPedido(telefone);
            // Remover do estado local - usando telefone pois a RPC deleta por telefone
            setPedidos((prev) => prev.filter((p) => p.telefone !== telefone));
            setNotificacao('Pedido finalizado com sucesso!');
            setTimeout(() => setNotificacao(null), 3000);
        } catch (error) {
            console.error('Erro ao finalizar pedido:', error);
            const mensagemErro = error instanceof Error ? error.message : 'Erro desconhecido';
            setNotificacao(`Erro: ${mensagemErro}`);
            setTimeout(() => setNotificacao(null), 5000);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-[#f97316] animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
                <p className="font-medium">Erro ao carregar pedidos</p>
                <p className="text-sm opacity-80">{error}</p>
            </div>
        );
    }

    const colunas: StatusFunil[] = ['anotacao', 'cozinha', 'entrega'];

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Gestão de Pedidos</h2>
                <button
                    onClick={refetch}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-[#a1a1aa] rounded-lg hover:bg-[#242424] hover:text-white transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Atualizar
                </button>
            </div>

            {/* Notificação de sucesso */}
            {notificacao && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 flex items-center gap-3 animate-in slide-in-from-top">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-medium">{notificacao}</span>
                    <button
                        onClick={() => setNotificacao(null)}
                        className="ml-auto text-green-400/70 hover:text-green-400"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Grid de colunas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {colunas.map((status) => (
                    <KanbanColumn
                        key={status}
                        status={status}
                        pedidos={pedidos}
                        onMoveToNext={handleMoveToNext}
                        onFinalize={handleFinalize}
                    />
                ))}
            </div>
        </div>
    );
}
