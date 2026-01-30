import { Loader2, RefreshCw } from 'lucide-react';
import { StatsCards } from './StatsCards';
import { FlowMeter } from './FlowMeter';
import { TopProducts } from './TopProducts';
import { BotToggle } from './BotToggle';
import { useAnalytics } from '../../hooks/useAnalytics';

export function DashboardPage() {
    const { analytics, loading, error, refetch } = useAnalytics();

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
                <p className="font-medium">Erro ao carregar dashboard</p>
                <p className="text-sm opacity-80">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Dashboard</h2>
                <button
                    onClick={refetch}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-[#a1a1aa] rounded-lg hover:bg-[#242424] hover:text-white transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Atualizar
                </button>
            </div>

            {/* Bot Toggle - Atalho Rápido */}
            <BotToggle />

            {/* Stats Cards */}
            <StatsCards
                vendasHoje={analytics.vendasHoje}
                pedidosHoje={analytics.pedidosHoje}
                ticketMedio={analytics.ticketMedio}
                vendasTotal={analytics.vendasTotal}
                pedidosTotal={analytics.pedidosTotal}
            />

            {/* Flow Meter */}
            <FlowMeter
                anotacao={analytics.statusCount.anotacao}
                cozinha={analytics.statusCount.cozinha}
                entrega={analytics.statusCount.entrega}
            />

            {/* Grid com Top Products e outras infos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopProducts produtos={analytics.topProdutos} />

                {/* Últimos pedidos finalizados */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        Últimos Pedidos Finalizados
                    </h3>

                    {analytics.ultimosPedidos.length === 0 ? (
                        <p className="text-[#a1a1aa] text-center py-8">
                            Nenhum pedido no histórico
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {analytics.ultimosPedidos.map((pedido, index) => (
                                <div
                                    key={pedido.id || index}
                                    className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium text-white">
                                            {pedido.nome_cliente}
                                        </p>
                                        <p className="text-sm text-[#a1a1aa] truncate max-w-[200px]">
                                            {pedido.ultimo_pedido}
                                        </p>
                                    </div>
                                    <p className="text-[#f97316] font-semibold whitespace-nowrap">
                                        R$ {(pedido.valor_gasto || 0).toFixed(2).replace('.', ',')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
