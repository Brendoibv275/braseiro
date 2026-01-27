import { Plus } from 'lucide-react';
import type { Produto } from '../../types';

interface ProductCardProps {
    produto: Produto;
    onAdd: (produto: Produto) => void;
}

export function ProductCard({ produto, onAdd }: ProductCardProps) {
    const categoriaColors: Record<string, string> = {
        Hambúrguer: 'bg-orange-500/20 text-orange-400',
        Bebida: 'bg-blue-500/20 text-blue-400',
        Adicional: 'bg-green-500/20 text-green-400',
        Batata: 'bg-yellow-500/20 text-yellow-400',
    };

    return (
        <div
            onClick={() => onAdd(produto)}
            className="group relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-2 sm:p-3 cursor-pointer transition-all duration-200 hover:bg-[#242424] hover:border-[#f97316] hover:scale-[1.02] active:scale-[0.98] active:bg-[#2a2a2a] touch-manipulation"
        >
            <div className="flex items-start justify-between mb-1 sm:mb-2">
                <span
                    className={`text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${categoriaColors[produto.categoria] || 'bg-gray-500/20 text-gray-400'
                        }`}
                >
                    {produto.categoria}
                </span>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#f97316] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
            </div>

            <h3 className="text-sm sm:text-base font-semibold text-white mb-0.5 sm:mb-1 leading-tight">{produto.nome}</h3>

            {produto.descricao && (
                <p className="text-xs text-[#a1a1aa] mb-1 sm:mb-3 line-clamp-1 sm:line-clamp-2 hidden sm:block">
                    {produto.descricao}
                </p>
            )}

            <p className="text-base sm:text-xl font-bold text-[#f97316]">
                R$ {produto.preco.toFixed(2).replace('.', ',')}
            </p>
        </div>
    );
}
