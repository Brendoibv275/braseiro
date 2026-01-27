import { useState } from 'react';
import { Loader2, RefreshCw, Search, User, Phone, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { useHistory } from '../../hooks/useHistory';

export function HistoryPage() {
    const { data, loading, error, refetch } = useHistory();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeView, setActiveView] = useState<'pedidos' | 'clientes'>('pedidos');

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
        if (tel.length === 11) {
            return `(${tel.slice(0, 2)}) ${tel.slice(2, 7)}-${tel.slice(7)}`;
        }
        return tel;
    };

    // Filtrar pedidos por busca
    const pedidosFiltrados = data.pedidos.filter(
        (p) =>
            p.nome_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.telefone.includes(searchTerm) ||
            p.ultimo_pedido?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-[#a1a1aa] rounded-lg hover:bg-[#242424] hover:text-white transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Atualizar
                </button>
            </div>

            {/* Stats resumo */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 md:p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-[#f97316]/10">
                            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-[#f97316]" />
                        </div>
                        <span className="text-xs md:text-sm text-[#a1a1aa]">Total Vendas</span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-white truncate">{formatCurrency(data.totalVendas)}</p>
                </div>
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 md:p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <Calendar className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                        </div>
                        <span className="text-xs md:text-sm text-[#a1a1aa]">Total Pedidos</span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-white">{data.totalPedidos}</p>
                </div>
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 md:p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-green-500/10">
                            <User className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                        </div>
                        <span className="text-xs md:text-sm text-[#a1a1aa]">Clientes Únicos</span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-white">{data.clientesFrequentes.length}</p>
                </div>
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 md:p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                            <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
                        </div>
                        <span className="text-xs md:text-sm text-[#a1a1aa]">Ticket Médio</span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-white truncate">
                        {data.totalPedidos > 0
                            ? formatCurrency(data.totalVendas / data.totalPedidos)
                            : 'R$ 0,00'}
                    </p>
                </div>
            </div>

            {/* Tabs e Busca */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveView('pedidos')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeView === 'pedidos'
                            ? 'bg-[#f97316] text-white'
                            : 'bg-[#1a1a1a] text-[#a1a1aa] hover:bg-[#242424]'
                            }`}
                    >
                        Pedidos ({data.totalPedidos})
                    </button>
                    <button
                        onClick={() => setActiveView('clientes')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeView === 'clientes'
                            ? 'bg-[#f97316] text-white'
                            : 'bg-[#1a1a1a] text-[#a1a1aa] hover:bg-[#242424]'
                            }`}
                    >
                        Clientes Frequentes
                    </button>
                </div>

                {activeView === 'pedidos' && (
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a1a1aa]" />
                        <input
                            type="text"
                            placeholder="Buscar por nome, telefone ou pedido..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-80 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg pl-10 pr-4 py-2.5 text-base md:text-sm text-white placeholder:text-[#a1a1aa] focus:outline-none focus:border-[#f97316] transition-colors"
                        />
                    </div>
                )}
            </div>

            {/* Conteúdo */}
            {activeView === 'pedidos' ? (
                <>
                    {/* Desktop View (Table) */}
                    <div className="hidden md:block bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#0f0f0f]">
                                    <tr>
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
                                            <td colSpan={5} className="text-center py-8 text-[#a1a1aa]">
                                                {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum pedido no histórico'}
                                            </td>
                                        </tr>
                                    ) : (
                                        pedidosFiltrados.map((pedido, index) => (
                                            <tr
                                                key={pedido.id || index}
                                                className="border-t border-[#2a2a2a] hover:bg-[#242424] transition-colors"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-[#f97316]" />
                                                        <span className="text-white">{pedido.nome_cliente}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-4 h-4 text-[#a1a1aa]" />
                                                        <span className="text-[#a1a1aa]">{formatTelefone(pedido.telefone)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-white max-w-[200px] truncate block">
                                                        {pedido.ultimo_pedido}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-[#f97316] font-semibold">
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
                                {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum pedido no histórico'}
                            </div>
                        ) : (
                            pedidosFiltrados.map((pedido, index) => (
                                <div
                                    key={pedido.id || index}
                                    className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 active:scale-[0.98] transition-transform"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-[#f97316]/10 flex items-center justify-center">
                                                <User className="w-4 h-4 text-[#f97316]" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">{pedido.nome_cliente}</h3>
                                                <p className="text-xs text-[#a1a1aa]">{formatDate(pedido.data_finalizacao)}</p>
                                            </div>
                                        </div>
                                        <span className="text-[#f97316] font-bold text-lg">
                                            {formatCurrency(pedido.valor_gasto || 0)}
                                        </span>
                                    </div>

                                    <div className="mb-3 pl-10">
                                        <p className="text-sm text-gray-300 line-clamp-2">{pedido.ultimo_pedido}</p>
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
                            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index < 3
                                            ? 'bg-[#f97316] text-white'
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
                            <div className="flex justify-between text-sm">
                                <span className="text-[#a1a1aa]">{cliente.totalPedidos} pedidos</span>
                                <span className="text-[#f97316] font-semibold">
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
