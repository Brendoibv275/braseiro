import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { BurgerCustomizer } from './BurgerCustomizer';
import { useProducts } from '../../hooks/useProducts';
import type { Produto } from '../../types';

// Ordem fixa das categorias (nomes como aparecem no banco)
const ORDEM_CATEGORIAS = ['Hambúrguer', 'Batata', 'Bebida'] as const;

interface ProductGridProps {
    onAddToCart: (produto: Produto) => void;
}

export function ProductGrid({ onAddToCart }: ProductGridProps) {
    const { produtos, loading, error } = useProducts();
    const [categoriaAtiva, setCategoriaAtiva] = useState<string>('Todos');
    const [burgerParaCustomizar, setBurgerParaCustomizar] = useState<Produto | null>(null);

    // Categorias disponíveis (na ordem definida, sem Adicional)
    const categorias = useMemo(() => {
        const catsDisponiveis = new Set(produtos.map(p => p.categoria));
        const ordenadas = ORDEM_CATEGORIAS.filter(cat => catsDisponiveis.has(cat));
        return ['Todos', ...ordenadas];
    }, [produtos]);

    // Produtos filtrados (excluindo adicionais do grid principal)
    const produtosFiltrados = useMemo(() => {
        // Sempre filtra adicionais do grid principal
        const semAdicionais = produtos.filter(p => p.categoria !== 'Adicional');

        // Função para obter o índice da categoria na ordem definida
        const getOrdemCategoria = (categoria: string): number => {
            const index = ORDEM_CATEGORIAS.indexOf(categoria as typeof ORDEM_CATEGORIAS[number]);
            return index === -1 ? 999 : index; // Categorias não definidas vão para o final
        };

        if (categoriaAtiva === 'Todos') {
            // Ordena os produtos pela ordem das categorias
            return [...semAdicionais].sort((a, b) =>
                getOrdemCategoria(a.categoria) - getOrdemCategoria(b.categoria)
            );
        }
        return semAdicionais.filter(
            (p) => p.categoria?.toLowerCase() === categoriaAtiva.toLowerCase()
        );
    }, [produtos, categoriaAtiva]);

    // Adicionais disponíveis
    const adicionais = useMemo(() => {
        return produtos.filter(p => p.categoria === 'Adicional');
    }, [produtos]);

    // Handler para click em produto
    const handleProductClick = (produto: Produto) => {
        // Se for hambúrguer, abre modal de customização
        if (produto.categoria === 'Hambúrguer') {
            setBurgerParaCustomizar(produto);
        } else {
            // Outros produtos adicionam direto
            onAddToCart(produto);
        }
    };

    // Handler para confirmar burger com adicionais
    const handleBurgerConfirm = (burger: Produto, adicionaisSelecionados: Produto[]) => {
        // Adiciona o burger
        onAddToCart(burger);
        // Adiciona cada adicional selecionado
        adicionaisSelecionados.forEach(adicional => {
            onAddToCart(adicional);
        });
    };

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
                <p className="font-medium">Erro ao carregar produtos</p>
                <p className="text-sm opacity-80">{error}</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {/* Filtros de categoria - scroll horizontal em mobile */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categorias.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategoriaAtiva(cat)}
                            className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap flex-shrink-0 ${categoriaAtiva === cat
                                ? 'bg-[#FF4500] text-white shadow-lg shadow-[#FF4500]/25'
                                : 'bg-[#141414] text-[#a1a1aa] hover:bg-[#1f1f1f] hover:text-white'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid de produtos - responsivo */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {produtosFiltrados.map((produto) => (
                        <ProductCard
                            key={produto.id}
                            produto={produto}
                            onAdd={handleProductClick}
                        />
                    ))}
                </div>

                {produtosFiltrados.length === 0 && (
                    <div className="text-center py-12 text-[#a1a1aa]">
                        <p>Nenhum produto encontrado nesta categoria</p>
                    </div>
                )}
            </div>

            {/* Modal de customização do burger */}
            {burgerParaCustomizar && (
                <BurgerCustomizer
                    burger={burgerParaCustomizar}
                    adicionais={adicionais}
                    onConfirm={handleBurgerConfirm}
                    onClose={() => setBurgerParaCustomizar(null)}
                />
            )}
        </>
    );
}

