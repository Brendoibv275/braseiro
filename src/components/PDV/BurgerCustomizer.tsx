import { useState, useMemo } from 'react';
import { X, Plus, Minus, Check } from 'lucide-react';
import type { Produto } from '../../types';

interface BurgerCustomizerProps {
    burger: Produto;
    adicionais: Produto[];
    onConfirm: (burger: Produto, adicionaisSelecionados: Produto[]) => void;
    onClose: () => void;
}

export function BurgerCustomizer({ burger, adicionais, onConfirm, onClose }: BurgerCustomizerProps) {
    const [selecionados, setSelecionados] = useState<Map<number, number>>(new Map());

    const toggleAdicional = (adicional: Produto) => {
        setSelecionados(prev => {
            const novo = new Map(prev);
            if (novo.has(adicional.id)) {
                novo.delete(adicional.id);
            } else {
                novo.set(adicional.id, 1);
            }
            return novo;
        });
    };

    const alterarQuantidade = (adicionalId: number, delta: number) => {
        setSelecionados(prev => {
            const novo = new Map(prev);
            const atual = novo.get(adicionalId) || 0;
            const novaQtd = Math.max(0, Math.min(5, atual + delta));
            if (novaQtd === 0) {
                novo.delete(adicionalId);
            } else {
                novo.set(adicionalId, novaQtd);
            }
            return novo;
        });
    };

    const totalAdicionais = useMemo(() => {
        let total = 0;
        selecionados.forEach((qtd, id) => {
            const adicional = adicionais.find(a => a.id === id);
            if (adicional) {
                total += adicional.preco * qtd;
            }
        });
        return total;
    }, [selecionados, adicionais]);

    const totalFinal = burger.preco + totalAdicionais;

    const handleConfirmar = () => {
        const adicionaisList: Produto[] = [];
        selecionados.forEach((qtd, id) => {
            const adicional = adicionais.find(a => a.id === id);
            if (adicional) {
                // Adiciona múltiplas vezes conforme a quantidade
                for (let i = 0; i < qtd; i++) {
                    adicionaisList.push(adicional);
                }
            }
        });
        onConfirm(burger, adicionaisList);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#141414] border border-[#262626] rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#262626]">
                    <h2 className="text-lg font-bold text-white">Personalizar Burger</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-[#262626] hover:bg-[#363636] transition-colors"
                    >
                        <X className="w-5 h-5 text-[#a1a1aa]" />
                    </button>
                </div>

                {/* Burger selecionado */}
                <div className="p-4 bg-[#1a1a1a] border-b border-[#262626]">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-white font-semibold">{burger.nome}</h3>
                            {burger.descricao && (
                                <p className="text-sm text-[#a1a1aa] mt-1">{burger.descricao}</p>
                            )}
                        </div>
                        <span className="text-[#FF4500] font-bold">
                            R$ {burger.preco.toFixed(2).replace('.', ',')}
                        </span>
                    </div>
                </div>

                {/* Lista de adicionais */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <h4 className="text-sm font-medium text-[#a1a1aa] mb-3 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-green-400" />
                        Adicionais (opcional)
                    </h4>

                    {adicionais.length === 0 ? (
                        <p className="text-sm text-[#666] text-center py-4">
                            Nenhum adicional disponível
                        </p>
                    ) : (
                        adicionais.map((adicional) => {
                            const qtd = selecionados.get(adicional.id) || 0;
                            const isSelected = qtd > 0;

                            return (
                                <div
                                    key={adicional.id}
                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isSelected
                                            ? 'bg-green-500/10 border-green-500/30'
                                            : 'bg-[#1a1a1a] border-[#262626] hover:border-[#363636]'
                                        }`}
                                >
                                    <div
                                        className="flex-1 cursor-pointer"
                                        onClick={() => toggleAdicional(adicional)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected
                                                    ? 'bg-green-500 border-green-500'
                                                    : 'border-[#464646]'
                                                }`}>
                                                {isSelected && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <span className="text-white font-medium">{adicional.nome}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="text-green-400 font-medium text-sm">
                                            +R$ {adicional.preco.toFixed(2).replace('.', ',')}
                                        </span>

                                        {isSelected && (
                                            <div className="flex items-center gap-1 bg-[#0a0a0a] rounded-lg p-1">
                                                <button
                                                    onClick={() => alterarQuantidade(adicional.id, -1)}
                                                    className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#262626] transition-colors"
                                                >
                                                    <Minus className="w-3 h-3 text-[#a1a1aa]" />
                                                </button>
                                                <span className="w-6 text-center text-white text-sm font-medium">
                                                    {qtd}
                                                </span>
                                                <button
                                                    onClick={() => alterarQuantidade(adicional.id, 1)}
                                                    className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#262626] transition-colors"
                                                >
                                                    <Plus className="w-3 h-3 text-[#a1a1aa]" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer com total e botão */}
                <div className="p-4 border-t border-[#262626] bg-[#0a0a0a]">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[#a1a1aa]">Total:</span>
                        <span className="text-2xl font-bold text-[#FF4500]">
                            R$ {totalFinal.toFixed(2).replace('.', ',')}
                        </span>
                    </div>
                    <button
                        onClick={handleConfirmar}
                        className="w-full bg-[#FF4500] hover:bg-[#E63E00] text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <Check className="w-5 h-5" />
                        Adicionar ao Pedido
                    </button>
                </div>
            </div>
        </div>
    );
}
