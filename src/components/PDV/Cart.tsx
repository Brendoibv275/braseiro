import { useState } from 'react';
import { ShoppingCart, Send, User, Phone, Loader2, X, Store, Truck, MessageSquare } from 'lucide-react';
import { CartItem } from './CartItem';
import type { ItemCarrinho } from '../../types';
import { useOrders } from '../../hooks/useOrders';

interface CartProps {
    itens: ItemCarrinho[];
    onUpdateQuantity: (produtoId: number, quantidade: number) => void;
    onRemove: (produtoId: number) => void;
    onClear: () => void;
    hideHeader?: boolean;
}

type TipoPedido = 'loja' | 'delivery';

export function Cart({ itens, onUpdateQuantity, onRemove, onClear, hideHeader = false }: CartProps) {
    const [tipoPedido, setTipoPedido] = useState<TipoPedido>('loja');
    const [nomeCliente, setNomeCliente] = useState('');
    const [telefone, setTelefone] = useState('');
    const [observacoes, setObservacoes] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

    const { criarPedido } = useOrders();

    const total = itens.reduce(
        (acc, item) => acc + item.produto.preco * item.quantidade,
        0
    );

    const formatarTelefone = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 11) {
            return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        return value;
    };

    const gerarResumoPedido = () => {
        return itens
            .map((item) => `${item.quantidade}x ${item.produto.nome}`)
            .join(', ');
    };

    const handleEnviar = async () => {
        if (!nomeCliente.trim()) {
            setMensagem({ tipo: 'erro', texto: 'Preencha o nome do cliente' });
            return;
        }

        if (tipoPedido === 'delivery' && !telefone.trim()) {
            setMensagem({ tipo: 'erro', texto: 'Preencha o telefone para delivery' });
            return;
        }

        if (itens.length === 0) {
            setMensagem({ tipo: 'erro', texto: 'Adicione itens ao pedido' });
            return;
        }

        setEnviando(true);
        setMensagem(null);

        try {
            const resumo = gerarResumoPedido();
            // Se for loja, usa "1" como telefone para identificar
            const telefoneNumeros = tipoPedido === 'loja' ? '1' : telefone.replace(/\D/g, '');

            await criarPedido(telefoneNumeros, nomeCliente, resumo, total, observacoes.trim() || undefined);

            setMensagem({ tipo: 'sucesso', texto: 'Pedido enviado para a cozinha!' });
            setNomeCliente('');
            setTelefone('');
            setObservacoes('');
            onClear();
        } catch (error) {
            setMensagem({
                tipo: 'erro',
                texto: error instanceof Error ? error.message : 'Erro ao enviar pedido',
            });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="bg-[#141414] border border-[#262626] rounded-xl h-full flex flex-col">
            {/* Header - oculto quando dentro do modal mobile */}
            {!hideHeader && (
                <div className="flex items-center gap-3 p-4 border-b border-[#262626]">
                    <ShoppingCart className="w-5 h-5 text-[#FF4500]" />
                    <h2 className="font-semibold text-white">Pedido Atual</h2>
                    {itens.length > 0 && (
                        <span className="ml-auto bg-[#FF4500] text-white text-xs font-bold px-2 py-1 rounded-full">
                            {itens.reduce((acc, i) => acc + i.quantidade, 0)}
                        </span>
                    )}
                </div>
            )}

            {/* Toggle Loja / Delivery */}
            <div className="p-4 border-b border-[#262626]">
                <div className="flex gap-2 p-1 bg-[#0a0a0a] rounded-lg">
                    <button
                        onClick={() => setTipoPedido('loja')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md font-medium text-sm transition-all ${tipoPedido === 'loja'
                            ? 'bg-[#FF4500] text-white'
                            : 'text-[#a1a1aa] hover:text-white'
                            }`}
                    >
                        <Store className="w-4 h-4" />
                        Loja
                    </button>
                    <button
                        onClick={() => setTipoPedido('delivery')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md font-medium text-sm transition-all ${tipoPedido === 'delivery'
                            ? 'bg-[#FF4500] text-white'
                            : 'text-[#a1a1aa] hover:text-white'
                            }`}
                    >
                        <Truck className="w-4 h-4" />
                        Delivery
                    </button>
                </div>
            </div>

            {/* Formulário do cliente */}
            <div className="p-4 space-y-3 border-b border-[#262626]">
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a1a1aa]" />
                    <input
                        type="text"
                        placeholder="Nome do cliente"
                        value={nomeCliente}
                        onChange={(e) => setNomeCliente(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-[#a1a1aa] focus:outline-none focus:border-[#FF4500] transition-colors"
                    />
                </div>

                {/* Campo de telefone - só aparece no delivery */}
                {tipoPedido === 'delivery' && (
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a1a1aa]" />
                        <input
                            type="tel"
                            placeholder="(00) 00000-0000"
                            value={telefone}
                            onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                            className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-[#a1a1aa] focus:outline-none focus:border-[#FF4500] transition-colors"
                        />
                    </div>
                )}

                {/* Campo de observações */}
                <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-[#a1a1aa]" />
                    <textarea
                        placeholder="Observações (sabor refri, ponto da carne, sem cebola...)"
                        value={observacoes}
                        onChange={(e) => setObservacoes(e.target.value)}
                        rows={2}
                        className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-[#a1a1aa] focus:outline-none focus:border-[#FF4500] transition-colors resize-none"
                    />
                </div>
            </div>

            {/* Lista de itens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {itens.length === 0 ? (
                    <div className="text-center py-8 text-[#a1a1aa]">
                        <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Clique em um produto para adicionar</p>
                    </div>
                ) : (
                    itens.map((item) => (
                        <CartItem
                            key={item.produto.id}
                            item={item}
                            onUpdateQuantity={onUpdateQuantity}
                            onRemove={onRemove}
                        />
                    ))
                )}
            </div>

            {/* Mensagem de feedback */}
            {mensagem && (
                <div
                    className={`mx-4 p-3 rounded-lg flex items-center gap-2 ${mensagem.tipo === 'sucesso'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                        }`}
                >
                    <span className="flex-1 text-sm">{mensagem.texto}</span>
                    <button onClick={() => setMensagem(null)}>
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Footer com total e botão */}
            <div className="p-4 border-t border-[#262626] space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-[#a1a1aa]">Total:</span>
                    <span className="text-2xl font-bold text-[#FF4500]">
                        R$ {total.toFixed(2).replace('.', ',')}
                    </span>
                </div>

                <button
                    onClick={handleEnviar}
                    disabled={enviando || itens.length === 0}
                    className="w-full bg-[#FF4500] hover:bg-[#E63E00] disabled:bg-[#262626] disabled:text-[#a1a1aa] text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {enviando ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Enviando...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            Enviar para Cozinha
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
