import { useState, useCallback } from 'react';
import {
    Flame,
    ShoppingCart,
    Loader2,
    CheckCircle,
    User,
    Phone,
    MessageSquare,
    Bell,
} from 'lucide-react';
import { ProductGrid } from '../PDV/ProductGrid';
import { CartItem } from '../PDV/CartItem';
import { supabase } from '../../lib/supabase';
import type { Produto, ItemCarrinho } from '../../types';

export function PublicMenuPage() {
    const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [nomeCliente, setNomeCliente] = useState('');
    const [telefone, setTelefone] = useState('');
    const [observacoes, setObservacoes] = useState('');
    const [querNotificacao, setQuerNotificacao] = useState(false);
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Handler para adicionar ao carrinho (usado pelo ProductGrid)
    const handleAddToCart = useCallback((produto: Produto) => {
        setCarrinho((prev) => {
            const existente = prev.find((item) => item.produto.id === produto.id);
            if (existente) {
                return prev.map((item) =>
                    item.produto.id === produto.id
                        ? { ...item, quantidade: item.quantidade + 1 }
                        : item
                );
            }
            return [...prev, { produto, quantidade: 1 }];
        });
    }, []);

    const handleUpdateQuantity = useCallback((produtoId: number, quantidade: number) => {
        if (quantidade <= 0) {
            setCarrinho((prev) => prev.filter((item) => item.produto.id !== produtoId));
        } else {
            setCarrinho((prev) =>
                prev.map((item) =>
                    item.produto.id === produtoId ? { ...item, quantidade } : item
                )
            );
        }
    }, []);

    const handleRemoveFromCart = useCallback((produtoId: number) => {
        setCarrinho((prev) => prev.filter((item) => item.produto.id !== produtoId));
    }, []);

    const totalCarrinho = carrinho.reduce(
        (total, item) => total + item.produto.preco * item.quantidade,
        0
    );

    const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);

    const formatResumoPedido = () => {
        return carrinho
            .map(
                (item) =>
                    `${item.quantidade}x ${item.produto.nome}`
            )
            .join(', ');
    };

    const formatarTelefone = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 11) {
            return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        return value;
    };

    const handleEnviarPedido = async () => {
        if (!nomeCliente.trim()) {
            setError('Por favor, preencha seu nome.');
            return;
        }

        if (querNotificacao && !telefone.trim()) {
            setError('Por favor, preencha seu telefone para receber notificação.');
            return;
        }

        if (carrinho.length === 0) {
            setError('Seu carrinho está vazio.');
            return;
        }

        setSending(true);
        setError(null);

        try {
            // Gera um ID único para pedidos via QRCode sem telefone
            const telefoneValue = querNotificacao
                ? telefone.replace(/\D/g, '')
                : `QR${Date.now()}`;

            const { error: insertError } = await supabase.from('hbn_clientes').insert({
                telefone: telefoneValue,
                nome_cliente: nomeCliente.trim(),
                resumo_pedido: formatResumoPedido(),
                observacoes: observacoes.trim() || null,
                status_funil: 'anotacao',
                valor_total: totalCarrinho,
                data_pedido: new Date().toISOString(),
                pausa: null,
            });

            if (insertError) throw insertError;

            setSuccess(true);
            setCarrinho([]);
            setNomeCliente('');
            setTelefone('');
            setObservacoes('');
            setQuerNotificacao(false);
            setShowCheckout(false);
        } catch (err) {
            console.error('Erro ao enviar pedido:', err);
            setError('Erro ao enviar pedido. Tente novamente.');
        } finally {
            setSending(false);
        }
    };

    // Tela de sucesso
    if (success) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
                        <CheckCircle className="w-10 h-10 text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-4">Pedido Enviado!</h1>
                    <p className="text-[#a1a1aa] mb-6">
                        Seu pedido foi recebido e está sendo preparado. Em breve você será chamado!
                    </p>
                    <button
                        onClick={() => setSuccess(false)}
                        className="px-6 py-3 bg-[#FF4500] hover:bg-[#E63E00] text-white font-semibold rounded-lg transition-colors"
                    >
                        Fazer novo pedido
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] pb-24">
            {/* Header */}
            <header className="bg-[#141414] border-b border-[#262626] p-4 sticky top-0 z-40">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#FF4500] to-[#FF6B35] rounded-xl flex items-center justify-center">
                            <Flame className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">Braseiro</h1>
                            <p className="text-xs text-[#a1a1aa]">Cardápio Digital</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowCart(!showCart)}
                        className="relative p-2 bg-[#262626] rounded-lg"
                    >
                        <ShoppingCart className="w-6 h-6 text-white" />
                        {totalItens > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF4500] text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {totalItens}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* Produtos - Reutiliza exatamente o ProductGrid do PDV */}
            <main className="max-w-4xl mx-auto p-4">
                <ProductGrid onAddToCart={handleAddToCart} />
            </main>

            {/* Cart Slide */}
            {showCart && (
                <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowCart(false)}>
                    <div
                        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[#141414] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-[#262626] flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white">Seu Pedido</h2>
                            <button
                                onClick={() => setShowCart(false)}
                                className="p-2 hover:bg-[#262626] rounded-lg transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {carrinho.length === 0 ? (
                            <div className="p-8 text-center">
                                <ShoppingCart className="w-12 h-12 text-[#52525b] mx-auto mb-4" />
                                <p className="text-[#a1a1aa]">Seu carrinho está vazio</p>
                            </div>
                        ) : (
                            <>
                                <div className="p-4 space-y-2">
                                    {carrinho.map((item) => (
                                        <CartItem
                                            key={item.produto.id}
                                            item={item}
                                            onUpdateQuantity={handleUpdateQuantity}
                                            onRemove={handleRemoveFromCart}
                                        />
                                    ))}
                                </div>

                                <div className="p-4 border-t border-[#262626]">
                                    <div className="flex justify-between text-lg font-bold text-white mb-4">
                                        <span>Total</span>
                                        <span>R$ {totalCarrinho.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowCart(false);
                                            setShowCheckout(true);
                                        }}
                                        className="w-full py-3 bg-[#FF4500] hover:bg-[#E63E00] text-white font-semibold rounded-lg transition-colors"
                                    >
                                        Finalizar Pedido
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Checkout Modal */}
            {showCheckout && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#141414] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b border-[#262626] flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Seus dados</h2>
                            <button
                                onClick={() => setShowCheckout(false)}
                                className="p-2 hover:bg-[#262626] rounded-lg transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Nome */}
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a1a1aa]" />
                                <input
                                    type="text"
                                    value={nomeCliente}
                                    onChange={(e) => setNomeCliente(e.target.value)}
                                    placeholder="Seu nome"
                                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-[#52525b] focus:outline-none focus:border-[#FF4500]"
                                />
                            </div>

                            {/* Toggle de notificação */}
                            <div className="bg-[#0a0a0a] rounded-lg p-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={querNotificacao}
                                        onChange={(e) => setQuerNotificacao(e.target.checked)}
                                        className="w-5 h-5 rounded border-[#262626] bg-[#1a1a1a] text-[#FF4500] focus:ring-[#FF4500] focus:ring-offset-0"
                                    />
                                    <Bell className="w-4 h-4 text-[#a1a1aa]" />
                                    <span className="text-white text-sm">Receber aviso quando estiver pronto</span>
                                </label>
                            </div>

                            {querNotificacao && (
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a1a1aa]" />
                                    <input
                                        type="tel"
                                        value={telefone}
                                        onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                                        placeholder="(99) 99999-9999"
                                        className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-[#52525b] focus:outline-none focus:border-[#FF4500]"
                                    />
                                </div>
                            )}

                            {/* Observações */}
                            <div className="relative">
                                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-[#a1a1aa]" />
                                <textarea
                                    placeholder="Observações (ponto da carne, sem cebola...)"
                                    value={observacoes}
                                    onChange={(e) => setObservacoes(e.target.value)}
                                    rows={2}
                                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-[#52525b] focus:outline-none focus:border-[#FF4500] resize-none"
                                />
                            </div>

                            {/* Resumo do pedido */}
                            <div className="bg-[#0a0a0a] rounded-lg p-4">
                                <h3 className="font-medium text-white mb-2">Resumo do pedido</h3>
                                {carrinho.map((item) => (
                                    <div key={item.produto.id} className="flex justify-between text-sm text-[#a1a1aa]">
                                        <span>
                                            {item.quantidade}x {item.produto.nome}
                                        </span>
                                        <span>
                                            R$ {(item.produto.preco * item.quantidade).toFixed(2).replace('.', ',')}
                                        </span>
                                    </div>
                                ))}
                                <div className="flex justify-between text-white font-bold mt-2 pt-2 border-t border-[#262626]">
                                    <span>Total</span>
                                    <span>R$ {totalCarrinho.toFixed(2).replace('.', ',')}</span>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCheckout(false)}
                                    className="flex-1 py-3 bg-[#262626] hover:bg-[#363636] text-white font-semibold rounded-lg transition-colors"
                                >
                                    Voltar
                                </button>
                                <button
                                    onClick={handleEnviarPedido}
                                    disabled={sending}
                                    className="flex-1 py-3 bg-[#FF4500] hover:bg-[#E63E00] disabled:bg-[#FF4500]/50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    {sending ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        'Enviar Pedido'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Carrinho flutuante */}
            {carrinho.length > 0 && !showCart && !showCheckout && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent">
                    <button
                        onClick={() => setShowCart(true)}
                        className="w-full max-w-4xl mx-auto flex items-center justify-between py-4 px-6 bg-[#FF4500] hover:bg-[#E63E00] rounded-xl transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <ShoppingCart className="w-6 h-6 text-white" />
                            <span className="text-white font-medium">
                                {totalItens} {totalItens === 1 ? 'item' : 'itens'}
                            </span>
                        </div>
                        <span className="text-white font-bold">
                            R$ {totalCarrinho.toFixed(2).replace('.', ',')}
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
}
