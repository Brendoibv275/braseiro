import { Minus, Plus, Trash2 } from 'lucide-react';
import type { ItemCarrinho } from '../../types';

interface CartItemProps {
    item: ItemCarrinho;
    onUpdateQuantity: (produtoId: number, quantidade: number) => void;
    onRemove: (produtoId: number) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
    const subtotal = item.produto.preco * item.quantidade;

    return (
        <div className="flex items-center gap-3 bg-[#1a1a1a] rounded-lg p-3">
            <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{item.produto.nome}</p>
                <p className="text-sm text-[#a1a1aa]">
                    R$ {item.produto.preco.toFixed(2).replace('.', ',')}
                </p>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() =>
                        onUpdateQuantity(item.produto.id, Math.max(0, item.quantidade - 1))
                    }
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-[#2a2a2a] text-white hover:bg-[#3a3a3a] transition-colors"
                >
                    <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center text-white font-medium">
                    {item.quantidade}
                </span>
                <button
                    onClick={() => onUpdateQuantity(item.produto.id, item.quantidade + 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-[#f97316] text-white hover:bg-[#ea580c] transition-colors"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <p className="w-20 text-right text-[#f97316] font-semibold">
                R$ {subtotal.toFixed(2).replace('.', ',')}
            </p>

            <button
                onClick={() => onRemove(item.produto.id)}
                className="p-2 text-[#a1a1aa] hover:text-red-400 transition-colors"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}
