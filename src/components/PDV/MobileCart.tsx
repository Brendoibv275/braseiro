import { useState } from 'react';
import { ShoppingCart, X } from 'lucide-react';
import { Cart } from './Cart';
import type { ItemCarrinho } from '../../types';

interface MobileCartProps {
    itens: ItemCarrinho[];
    onUpdateQuantity: (produtoId: number, quantidade: number) => void;
    onRemove: (produtoId: number) => void;
    onClear: () => void;
}

export function MobileCart({ itens, onUpdateQuantity, onRemove, onClear }: MobileCartProps) {
    const [isOpen, setIsOpen] = useState(false);

    const totalItens = itens.reduce((acc, item) => acc + item.quantidade, 0);
    const totalValor = itens.reduce((acc, item) => acc + item.produto.preco * item.quantidade, 0);

    return (
        <>
            {/* Botão flutuante do carrinho - só aparece no mobile */}
            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 bg-[#FF4500] rounded-full shadow-lg shadow-[#FF4500]/30 flex items-center justify-center active:scale-95 transition-transform"
            >
                <ShoppingCart className="w-6 h-6 text-white" />
                {totalItens > 0 && (
                    <span className="absolute -top-1 -right-1 bg-white text-[#FF4500] text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                        {totalItens}
                    </span>
                )}
            </button>

            {/* Badge com valor total - aparece quando tem itens */}
            {totalItens > 0 && !isOpen && (
                <div className="md:hidden fixed bottom-20 right-20 z-40 bg-[#1a1a1a] border border-[#262626] rounded-lg px-3 py-1 shadow-lg">
                    <span className="text-[#FF4500] font-bold text-sm">
                        R$ {totalValor.toFixed(2).replace('.', ',')}
                    </span>
                </div>
            )}

            {/* Overlay e Modal do carrinho */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="md:hidden fixed inset-0 bg-black/70 z-50 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal do carrinho */}
                    <div className="md:hidden fixed inset-x-0 bottom-0 top-16 z-50 flex flex-col">
                        {/* Header do modal */}
                        <div className="flex items-center justify-between p-4 bg-[#0a0a0a] border-b border-[#262626]">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-[#FF4500]" />
                                Carrinho
                                {totalItens > 0 && (
                                    <span className="bg-[#FF4500] text-white text-xs px-2 py-0.5 rounded-full">
                                        {totalItens}
                                    </span>
                                )}
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[#a1a1aa] hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Conteúdo do carrinho */}
                        <div className="flex-1 overflow-hidden">
                            <Cart
                                itens={itens}
                                onUpdateQuantity={onUpdateQuantity}
                                onRemove={onRemove}
                                onClear={() => {
                                    onClear();
                                    setIsOpen(false);
                                }}
                                hideHeader
                            />
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
