import { DollarSign, ShoppingBag, TrendingUp, History } from 'lucide-react';

interface StatsCardsProps {
    vendasHoje: number;
    pedidosHoje: number;
    ticketMedio: number;
    vendasTotal: number;
    pedidosTotal: number;
}

export function StatsCards({
    vendasHoje,
    pedidosHoje,
    ticketMedio,
    vendasTotal,
    pedidosTotal,
}: StatsCardsProps) {
    const formatCurrency = (value: number) => {
        return `R$ ${value.toFixed(2).replace('.', ',')}`;
    };

    const stats = [
        {
            label: 'Vendas Hoje',
            value: formatCurrency(vendasHoje),
            icon: DollarSign,
            color: 'text-green-500 bg-green-500/10',
        },
        {
            label: 'Pedidos Hoje',
            value: pedidosHoje.toString(),
            icon: ShoppingBag,
            color: 'text-blue-500 bg-blue-500/10',
        },
        {
            label: 'Ticket Médio',
            value: formatCurrency(ticketMedio),
            icon: TrendingUp,
            color: 'text-[#f97316] bg-[#f97316]/10',
        },
        {
            label: 'Total Histórico',
            value: `${pedidosTotal} pedidos`,
            subvalue: formatCurrency(vendasTotal),
            icon: History,
            color: 'text-purple-500 bg-purple-500/10',
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${stat.color}`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <span className="text-sm text-[#a1a1aa]">{stat.label}</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    {stat.subvalue && (
                        <p className="text-sm text-[#a1a1aa] mt-1">{stat.subvalue}</p>
                    )}
                </div>
            ))}
        </div>
    );
}
