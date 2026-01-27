import { LogOut } from 'lucide-react';

interface HeaderProps {
    onLogout?: () => void;
}

export function Header({ onLogout }: HeaderProps) {
    return (
        <header className="bg-[#0a0a0a] border-b border-[#262626] px-4 md:px-6 py-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img
                        src="/logo.png"
                        alt="Braseiro"
                        className="w-10 h-10 md:w-12 md:h-12 object-contain"
                    />
                    <div>
                        <h1 className="text-lg md:text-xl font-bold text-white">Braseiro</h1>
                        <p className="text-[10px] md:text-xs text-[#FF4500]">Nordestino</p>
                    </div>
                </div>

                {onLogout && (
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-3 py-2 text-[#a1a1aa] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors"
                        title="Sair"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="hidden sm:inline text-sm">Sair</span>
                    </button>
                )}
            </div>
        </header>
    );
}
