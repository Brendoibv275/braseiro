import { useState } from 'react';
import {
    Loader2,
    RefreshCw,
    Search,
    User,
    Phone,
    DollarSign,
    TrendingUp,
    CheckCircle,
    XCircle,
    Filter
} from 'lucide-react';
import { useHistory } from '../../hooks/useHistory';
import type { TipoSaida } from '../../types';

type FiltroSaida = 'todos' | TipoSaida;

export function HistoryPage() {
    const { data, loading, error, refetch } = useHistory();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeView, setActiveView] = useState<'pedidos' | 'clientes'>('pedidos');
    const [filtroSaida, setFiltroSaida] = useState<FiltroSaida>('todos');

    const formatCurrency = (value: number) => {
        return `R$ ${value.toFixed(2).replace('.', ',')}`;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatTelefone = (tel: string) => {
        if (tel === '1') return 'Loja';
        if (tel.length === 11) {
            return `(${tel.slice(0, 2)}) ${tel.slice(2, 7)}-${tel.slice(7)}`;
        }
        return tel;
    };

    // Filtrar pedidos por busca e saída
    const pedidosFiltrados = data.pedidos.filter((p) => {
        const matchSearch =
            p.nome_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.telefone.includes(searchTerm) ||
            p.ultimo_pedido?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchSaida = filtroSaida === 'todos' || p.saida === filtroSaida;

        return matchSearch && matchSaida;
    });

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
                <p className="font-medium">Erro ao carregar histórico</p>
                <p className="text-sm opacity-80">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-16 md:pb-0">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Histórico Completo</h2>
                <button
                    onClick={refetch}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-[#a1a1aa] rounded-lg hover:bg-[#242424] hover:text-white transition-colors border border-[#2a2a2a]"
                >
                    <RefreshCw className="w-4 h-4" />
                    Atualizar
                </button>
            </div>

            {/* Stats resumo */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-[#2a2a2a] rounded-xl p-3 md:p-4 shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-[#FF4500]/20 to-orange-500/20 border border-[#FF4500]/30">
                            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-[#FF4500]" />
                        </div>
                        <span className="text-xs md:text-sm text-[#a1a1aa]">Total Vendas</span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-white truncate">{formatCurrency(data.totalVendas)}</p>
                </div>
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-[#2a2a2a] rounded-xl p-3 md:p-4 shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
                            <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
                        </div>
                        <span className="text-xs md:text-sm text-[#a1a1aa]">Finalizados</span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-emerald-400">{data.totalFinalizados}</p>
                </div>
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-[#2a2a2a] rounded-xl p-3 md:p-4 shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30">
                            <XCircle className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
                        </div>
                        <span className="text-xs md:text-sm text-[#a1a1aa]">Cancelados</span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-red-400">{data.totalCancelados}</p>
                </div>
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-[#2a2a2a] rounded-xl p-3 md:p-4 shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30">
                            <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                        </div>
                        <span className="text-xs md:text-sm text-[#a1a1aa]">Ticket Médio</span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-white truncate">
                        {data.totalFinalizados > 0
                            ? formatCurrency(data.totalVendas / data.totalFinalizados)
                            : 'R$ 0,00'}
                    </p>
                </div>
            </div>

            {/* Tabs e Busca */}
            <div className="flex flex-col gap-4">
                {/* Linha 1: Tabs principais */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveView('pedidos')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeView === 'pedidos'
                            ? 'bg-[#FF4500] text-white shadow-lg shadow-[#FF4500]/20'
                            : 'bg-[#1a1a1a] text-[#a1a1aa] hover:bg-[#242424] border border-[#2a2a2a]'
                            }`}
                    >
                        Pedidos ({data.totalPedidos})
                    </button>
                    <button
                        onClick={() => setActiveView('clientes')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeView === 'clientes'
                            ? 'bg-[#FF4500] text-white shadow-lg shadow-[#FF4500]/20'
                            : 'bg-[#1a1a1a] text-[#a1a1aa] hover:bg-[#242424] border border-[#2a2a2a]'
                            }`}
                    >
                        Clientes Frequentes
                    </button>
                </div>

                {/* Linha 2: Filtros e Busca (só para pedidos) */}
                {activeView === 'pedidos' && (
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        {/* Filtros de saída */}
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-[#a1a1aa]" />
                            <div className="flex gap-1 p-1 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a]">
                                <button
                                    onClick={() => setFiltroSaida('todos')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filtroSaida === 'todos'
                                            ? 'bg-[#FF4500] text-white'
                                            : 'text-[#a1a1aa] hover:text-white'
                                        }`}
                                >
                                    Todos
                                </button>
                                <button
                                    onClick={() => setFiltroSaida('finalizados')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${filtroSaida === 'finalizados'
                                            ? 'bg-emerald-600 text-white'
                                            : 'text-[#a1a1aa] hover:text-emerald-400'
                                        }`}
                                >
                                    <CheckCircle className="w-3 h-3" />
                                    Finalizados
                                </button>
                                <button
                                    onClick={() => setFiltroSaida('cancelados')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${filtroSaida === 'cancelados'
                                            ? 'bg-red-600 text-white'
                                            : 'text-[#a1a1aa] hover:text-red-400'
                                        }`}
                                >
                                    <XCircle className="w-3 h-3" />
                                    Cancelados
                                </button>
                            </div>
                        </div>

                        {/* Busca */}
                        <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a1a1aa]" />
                            <input
                                type="text"
                                placeholder="Buscar por nome, telefone ou pedido..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-80 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg pl-10 pr-4 py-2.5 text-base md:text-sm text-white placeholder:text-[#a1a1aa] focus:outline-none focus:border-[#FF4500] transition-colors"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Conteúdo */}
            {activeView === 'pedidos' ? (
                <>
                    {/* Desktop View (Table) */}
                    <div className="hidden md:block bg-gradient-to-b from-[#1a1a1a] to-[#151515] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#0a0a0a]/80">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-sm font-medium text-[#a1a1aa]">Status</th>
                                        <th className="text-left px-4 py-3 text-sm font-medium text-[#a1a1aa]">Cliente</th>
                                        <th className="text-left px-4 py-3 text-sm font-medium text-[#a1a1aa]">Telefone</th>
                                        <th className="text-left px-4 py-3 text-sm font-medium text-[#a1a1aa]">Pedido</th>
                                        <th className="text-left px-4 py-3 text-sm font-medium text-[#a1a1aa]">Valor</th>
                                        <th className="text-left px-4 py-3 text-sm font-medium text-[#a1a1aa]">Data</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pedidosFiltrados.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-8 text-[#a1a1aa]">
                                                {searchTerm || filtroSaida !== 'todos'
                                                    ? 'Nenhum resultado encontrado'
                                                    : 'Nenhum pedido no histórico'}
                                            </td>
                                        </tr>
                                    ) : (
                                        pedidosFiltrados.map((pedido, index) => (
                                            <tr
                                                key={pedido.id || index}
                                                className={`border-t border-[#2a2a2a] hover:bg-[#242424] transition-colors ${pedido.saida === 'cancelados' ? 'bg-red-500/5' : ''
                                                    }`}
                                            >
                                                <td className="px-4 py-3">
                                                    {pedido.saida === 'cancelados' ? (
                                                        <span className="flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-500/20 px-2 py-1 rounded-full border border-red-500/30 w-fit">
                                                            <XCircle className="w-3 h-3" />
                                                            Cancelado
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-full border border-emerald-500/30 w-fit">
                                                            <CheckCircle className="w-3 h-3" />
                                                            Finalizado
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-[#FF4500]" />
                                                        <span className={pedido.saida === 'cancelados' ? 'text-[#a1a1aa]' : 'text-white'}>
                                                            {pedido.nome_cliente}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-4 h-4 text-[#a1a1aa]" />
                                                        <span className="text-[#a1a1aa]">{formatTelefone(pedido.telefone)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`max-w-[200px] truncate block ${pedido.saida === 'cancelados' ? 'text-[#a1a1aa] line-through' : 'text-white'
                                                        }`}>
                                                        {pedido.ultimo_pedido}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`font-semibold ${pedido.saida === 'cancelados' ? 'text-[#a1a1aa]' : 'text-[#FF4500]'
                                                        }`}>
                                                        {formatCurrency(pedido.valor_gasto || 0)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-[#a1a1aa] text-sm">
                                                        {formatDate(pedido.data_finalizacao)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile View (Cards) */}
                    <div className="md:hidden space-y-3 pb-4">
                        {pedidosFiltrados.length === 0 ? (
                            <div className="text-center py-8 text-[#a1a1aa] bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
                                {searchTerm || filtroSaida !== 'todos'
                                    ? 'Nenhum resultado encontrado'
                                    : 'Nenhum pedido no histórico'}
                            </div>
                        ) : (
                            pedidosFiltrados.map((pedido, index) => (
                                <div
                                    key={pedido.id || index}
                                    className={`bg-gradient-to-b from-[#1a1a1a] to-[#151515] border rounded-xl p-4 shadow-lg ${pedido.saida === 'cancelados'
                                            ? 'border-red-500/30'
                                            : 'border-[#2a2a2a]'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${pedido.saida === 'cancelados'
                                                    ? 'bg-red-500/20'
                                                    : 'bg-[#FF4500]/10'
                                                }`}>
                                                {pedido.saida === 'cancelados' ? (
                                                    <XCircle className="w-4 h-4 text-red-400" />
                                                ) : (
                                                    <User className="w-4 h-4 text-[#FF4500]" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className={`font-semibold ${pedido.saida === 'cancelados' ? 'text-[#a1a1aa]' : 'text-white'
                                                    }`}>{pedido.nome_cliente}</h3>
                                                <p className="text-xs text-[#a1a1aa]">{formatDate(pedido.data_finalizacao)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`font-bold text-lg ${pedido.saida === 'cancelados' ? 'text-[#a1a1aa]' : 'text-[#FF4500]'
                                                }`}>
                                                {formatCurrency(pedido.valor_gasto || 0)}
                                            </span>
                                            {pedido.saida === 'cancelados' && (
                                                <span className="block text-xs text-red-400 font-medium">Cancelado</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mb-3 pl-10">
                                        <p className={`text-sm line-clamp-2 ${pedido.saida === 'cancelados' ? 'text-[#666] line-through' : 'text-gray-300'
                                            }`}>{pedido.ultimo_pedido}</p>
                                    </div>

                                    <div className="flex items-center gap-2 pl-10 pt-2 border-t border-[#2a2a2a]">
                                        <Phone className="w-3 h-3 text-[#a1a1aa]" />
                                        <span className="text-xs text-[#a1a1aa]">{formatTelefone(pedido.telefone)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.clientesFrequentes.map((cliente, index) => (
                        <div
                            key={cliente.telefone}
                            className="bg-gradient-to-b from-[#1a1a1a] to-[#151515] border border-[#2a2a2a] rounded-xl p-4 shadow-lg hover:border-[#3a3a3a] transition-colors"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${index < 3
                                                ? 'bg-gradient-to-br from-[#FF4500] to-orange-600 text-white shadow-[#FF4500]/20'
                                                : 'bg-[#2a2a2a] text-[#a1a1aa]'
                                            }`}
                                    >
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">{cliente.nome_cliente}</p>
                                        <p className="text-sm text-[#a1a1aa]">{formatTelefone(cliente.telefone)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between text-sm bg-[#0a0a0a] rounded-lg p-3 border border-[#1f1f1f]">
                                <span className="text-[#a1a1aa]">{cliente.totalPedidos} pedidos</span>
                                <span className="text-[#FF4500] font-bold">
                                    {formatCurrency(cliente.totalGasto)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
