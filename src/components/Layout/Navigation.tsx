import { ShoppingCart, LayoutGrid, BarChart3, History, Settings } from 'lucide-react';
import type { CargoFuncionario } from '../../contexts/AuthContext';

type TabId = 'dashboard' | 'pdv' | 'cozinha' | 'historico' | 'configuracoes';

interface NavigationProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
    cargo: CargoFuncionario;
}

interface TabConfig {
    id: TabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    roles: CargoFuncionario[]; // Quais cargos podem ver essa tab
}

export function Navigation({ activeTab, onTabChange, cargo }: NavigationProps) {
    const allTabs: TabConfig[] = [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3, roles: ['admin'] },
        { id: 'pdv', label: 'Recepção (PDV)', icon: ShoppingCart, roles: ['admin', 'funcionario'] },
        { id: 'cozinha', label: 'Cozinha', icon: LayoutGrid, roles: ['admin', 'funcionario'] },
        { id: 'historico', label: 'Histórico', icon: History, roles: ['admin'] },
        { id: 'configuracoes', label: 'Configurações', icon: Settings, roles: ['admin'] },
    ];

    // Filtrar tabs baseado no cargo do usuário
    const tabs = allTabs.filter((tab) => tab.roles.includes(cargo));

    return (
        <>
            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-[#262626] z-50">
                <div className="flex justify-around items-center px-2 py-3 bg-[#0a0a0a]">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-full touch-manipulation ${activeTab === tab.id
                                ? 'text-[#FF4500]'
                                : 'text-[#a1a1aa] hover:text-white'
                                }`}
                        >
                            <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'animate-bounce-subtle' : ''}`} />
                            <span className="text-[10px] font-medium">{tab.label.split(' ')[0]}</span>
                        </button>
                    ))}
                </div>
            </nav>

            {/* Desktop Top Navigation */}
            <nav className="hidden md:block bg-[#0a0a0a] border-b border-[#262626] px-6">
                <div className="flex gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex items-center gap-2 px-5 py-4 font-medium transition-all border-b-2 ${activeTab === tab.id
                                ? 'text-[#FF4500] border-[#FF4500]'
                                : 'text-[#a1a1aa] border-transparent hover:text-white hover:bg-[#141414]'
                                }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </nav>
        </>
    );
}

export type { TabId };
