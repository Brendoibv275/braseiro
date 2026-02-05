import { useState } from 'react';
import { Loader2, RefreshCw, CheckCircle, X, XCircle } from 'lucide-react';
import { KanbanColumn } from './KanbanColumn';
import { useOrders } from '../../hooks/useOrders';
import { useRealtimeOrders } from '../../hooks/useRealtimeOrders';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { useOrderNotification } from '../../hooks/useOrderNotification';
import type { StatusFunil, Pedido } from '../../types';

export function KanbanBoard() {
    const {
        pedidos,
        loading,
        error,
        atualizarStatus,
        finalizarPedido,
        reativarIA,
        aceitarPagamento,
        cancelarPedido,
        refetch,
    } = useOrders();

    const [notificacao, setNotificacao] = useState<{ tipo: 'sucesso' | 'erro' | 'info'; texto: string } | null>(null);
    const [modalCancelar, setModalCancelar] = useState<Pedido | null>(null);

    // Estado local para atualizações otimistas (UI instantânea)
    const [pedidosLocais, setPedidosLocais] = useState<Pedido[] | null>(null);

    // Usar pedidos locais se existirem (otimista), senão usar do servidor
    const pedidosAtuais = pedidosLocais ?? pedidos;

    // Hook de real-time - chama refetch e limpa estado otimista
    useRealtimeOrders(() => {
        setPedidosLocais(null); // Limpar estado otimista
        refetch();
    });

    // Auto-refresh a cada 5 segundos para manter dados atualizados
    useAutoRefresh(() => {
        setPedidosLocais(null);
        refetch();
    }, 5000);

    // Notificação sonora quando novos pedidos chegam na cozinha
    useOrderNotification(pedidosAtuais);

    const mostrarNotificacao = (tipo: 'sucesso' | 'erro' | 'info', texto: string) => {
        setNotificacao({ tipo, texto });
        setTimeout(() => setNotificacao(null), tipo === 'erro' ? 5000 : 2000);
    };

    const handleMoveToNext = async (id: number, novoStatus: StatusFunil) => {
        // Atualização otimista - muda UI imediatamente
        setPedidosLocais(
            pedidosAtuais.map((p) => (p.id === id ? { ...p, status_funil: novoStatus } : p))
        );

        try {
            await atualizarStatus(id, novoStatus);
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            setPedidosLocais(null); // Reverter ao estado do servidor
            mostrarNotificacao('erro', 'Erro ao atualizar status');
        }
    };

    const handleFinalize = async (telefone: string) => {
        // Atualização otimista - remove da lista imediatamente
        setPedidosLocais(pedidosAtuais.filter((p) => p.telefone !== telefone));

        try {
            console.log('Iniciando finalização para telefone:', telefone);
            await finalizarPedido(telefone);
            mostrarNotificacao('sucesso', 'Pedido finalizado!');
        } catch (error) {
            console.error('Erro ao finalizar pedido:', error);
            setPedidosLocais(null); // Reverter ao estado do servidor
            const mensagemErro = error instanceof Error ? error.message : 'Erro desconhecido';
            mostrarNotificacao('erro', `Erro: ${mensagemErro}`);
        }
    };

    const handleReativarIA = async (id: number) => {
        // Atualização otimista
        setPedidosLocais(
            pedidosAtuais.map((p) => (p.id === id ? { ...p, pausa: 'ia' as const } : p))
        );

        try {
            await reativarIA(id);
            mostrarNotificacao('sucesso', 'IA reativada!');
        } catch (error) {
            console.error('Erro ao reativar IA:', error);
            setPedidosLocais(null);
            mostrarNotificacao('erro', 'Erro ao reativar IA');
        }
    };

    const handleAceitarPagamento = async (id: number) => {
        // Atualização otimista
        setPedidosLocais(
            pedidosAtuais.map((p) => (p.id === id ? { ...p, imagem: 'aceito' as const } : p))
        );

        try {
            await aceitarPagamento(id);
            mostrarNotificacao('sucesso', 'Pagamento aceito!');
        } catch (error) {
            console.error('Erro ao aceitar pagamento:', error);
            setPedidosLocais(null);
            mostrarNotificacao('erro', 'Erro ao aceitar pagamento');
        }
    };

    const handleCancelar = async (pedido: Pedido) => {
        setModalCancelar(pedido);
    };

    const confirmarCancelamento = async () => {
        if (!modalCancelar) return;

        // Atualização otimista - remove imediatamente
        setPedidosLocais(pedidosAtuais.filter((p) => p.id !== modalCancelar.id));
        setModalCancelar(null);

        try {
            await cancelarPedido(
                modalCancelar.id,
                modalCancelar.telefone,
                modalCancelar.nome_cliente,
                modalCancelar.resumo_pedido,
                modalCancelar.valor_total || 0
            );
            mostrarNotificacao('info', 'Pedido cancelado');
        } catch (error) {
            console.error('Erro ao cancelar:', error);
            setPedidosLocais(null);
            mostrarNotificacao('erro', 'Erro ao cancelar pedido');
        }
    };

    if (loading && pedidos.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-[#FF4500] animate-spin" />
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
                    onClick={() => {
                        setPedidosLocais(null);
                        refetch();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-[#a1a1aa] rounded-lg hover:bg-[#242424] hover:text-white transition-colors border border-[#2a2a2a]"
                >
                    <RefreshCw className="w-4 h-4" />
                    Atualizar
                </button>
            </div>

            {/* Notificação */}
            {notificacao && (
                <div className={`rounded-lg p-3 flex items-center gap-3 animate-in slide-in-from-top border ${notificacao.tipo === 'sucesso'
                    ? 'bg-green-500/20 border-green-500/30 text-green-400'
                    : notificacao.tipo === 'erro'
                        ? 'bg-red-500/20 border-red-500/30 text-red-400'
                        : 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                    }`}>
                    {notificacao.tipo === 'sucesso' && <CheckCircle className="w-5 h-5" />}
                    {notificacao.tipo === 'erro' && <XCircle className="w-5 h-5" />}
                    {notificacao.tipo === 'info' && <XCircle className="w-5 h-5" />}
                    <span className="font-medium">{notificacao.texto}</span>
                    <button
                        onClick={() => setNotificacao(null)}
                        className="ml-auto opacity-70 hover:opacity-100"
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
                        pedidos={pedidosAtuais}
                        onMoveToNext={handleMoveToNext}
                        onFinalize={handleFinalize}
                        onReativarIA={handleReativarIA}
                        onAceitarPagamento={handleAceitarPagamento}
                        onCancelar={handleCancelar}
                    />
                ))}
            </div>

            {/* Modal de Confirmação de Cancelamento */}
            {modalCancelar && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#141414] border border-[#262626] rounded-xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Cancelar Pedido?</h3>
                                <p className="text-sm text-[#a1a1aa]">Esta ação não pode ser desfeita</p>
                            </div>
                        </div>

                        <div className="bg-[#0a0a0a] rounded-lg p-4 mb-6 border border-[#1f1f1f]">
                            <p className="text-white font-medium">{modalCancelar.nome_cliente}</p>
                            <p className="text-sm text-[#a1a1aa] mt-1">{modalCancelar.resumo_pedido}</p>
                            {modalCancelar.valor_total && (
                                <p className="text-[#FF4500] font-bold mt-2">
                                    R$ {modalCancelar.valor_total.toFixed(2).replace('.', ',')}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setModalCancelar(null)}
                                className="flex-1 bg-[#1a1a1a] hover:bg-[#242424] text-white font-medium py-3 rounded-lg transition-colors border border-[#2a2a2a]"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={confirmarCancelamento}
                                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-red-500/20"
                            >
                                Confirmar Cancelamento
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
