import { useState, useCallback } from 'react';
import { Header } from './components/Layout/Header';
import { Navigation } from './components/Layout/Navigation';
import { ProductGrid } from './components/PDV/ProductGrid';
import { Cart } from './components/PDV/Cart';
import { MobileCart } from './components/PDV/MobileCart';
import { KanbanBoard } from './components/Kanban/KanbanBoard';
import { DashboardPage } from './components/Dashboard/DashboardPage';
import { HistoryPage } from './components/History/HistoryPage';
import type { Produto, ItemCarrinho } from './types';

type TabId = 'dashboard' | 'pdv' | 'cozinha' | 'historico';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);

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

  const handleUpdateQuantity = useCallback(
    (produtoId: number, quantidade: number) => {
      if (quantidade <= 0) {
        setCarrinho((prev) => prev.filter((item) => item.produto.id !== produtoId));
      } else {
        setCarrinho((prev) =>
          prev.map((item) =>
            item.produto.id === produtoId ? { ...item, quantidade } : item
          )
        );
      }
    },
    []
  );

  const handleRemoveFromCart = useCallback((produtoId: number) => {
    setCarrinho((prev) => prev.filter((item) => item.produto.id !== produtoId));
  }, []);

  const handleClearCart = useCallback(() => {
    setCarrinho([]);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'pdv':
        return (
          <>
            {/* Layout Desktop - grid com produtos e carrinho lado a lado */}
            <div className="hidden md:grid md:h-full lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 overflow-y-auto">
                <ProductGrid onAddToCart={handleAddToCart} />
              </div>
              <div className="h-full max-h-[calc(100vh-180px)]">
                <Cart
                  itens={carrinho}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveFromCart}
                  onClear={handleClearCart}
                />
              </div>
            </div>

            {/* Layout Mobile - só produtos, carrinho é flutuante */}
            <div className="md:hidden">
              <ProductGrid onAddToCart={handleAddToCart} />
            </div>

            {/* Carrinho flutuante mobile */}
            <MobileCart
              itens={carrinho}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemoveFromCart}
              onClear={handleClearCart}
            />
          </>
        );
      case 'cozinha':
        return <KanbanBoard />;
      case 'historico':
        return <HistoryPage />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 p-4 md:p-6 overflow-y-auto md:overflow-hidden">
        {renderContent()}

        {/* Spacer para compensar a navegação fixa do mobile - altura suficiente para nav + botão flutuante */}
        <div className="md:hidden h-28" aria-hidden="true" />
      </main>
    </div>
  );
}

export default App;
