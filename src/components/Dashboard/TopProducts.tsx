import { Flame, TrendingUp } from 'lucide-react';

interface TopProduto {
    nome: string;
    quantidade: number;
}

interface TopProductsProps {
    produtos: TopProduto[];
}

export function TopProducts({ produtos }: TopProductsProps) {
    if (produtos.length === 0) {
        return (
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-[#f97316]" />
                    Produtos Mais Vendidos
                </h3>
                <p className="text-[#a1a1aa] text-center py-8">
                    Nenhum dado de vendas ainda
                </p>
            </div>
        );
    }

    const maxQtd = Math.max(...produtos.map(p => p.quantidade));

    return (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#f97316]" />
                Produtos Mais Vendidos
            </h3>

            <div className="space-y-4">
                {produtos.map((produto, index) => {
                    const percentage = (produto.quantidade / maxQtd) * 100;
                    const isTop = index === 0;

                    return (
                        <div key={produto.nome}>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isTop
                                                ? 'bg-[#f97316] text-white'
                                                : 'bg-[#2a2a2a] text-[#a1a1aa]'
                                            }`}
                                    >
                                        {index + 1}
                                    </span>
                                    <span className={`font-medium ${isTop ? 'text-white' : 'text-[#a1a1aa]'}`}>
                                        {produto.nome}
                                    </span>
                                </div>
                                <span className="text-[#f97316] font-semibold">
                                    {produto.quantidade}x
                                </span>
                            </div>
                            <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${isTop ? 'bg-[#f97316]' : 'bg-[#f97316]/50'
                                        }`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
