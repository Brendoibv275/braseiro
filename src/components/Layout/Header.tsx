export function Header() {
    return (
        <header className="bg-[#0a0a0a] border-b border-[#262626] px-6 py-3">
            <div className="flex items-center gap-3">
                <img
                    src="/logo.png"
                    alt="Braseiro"
                    className="w-12 h-12 object-contain"
                />
                <div>
                    <h1 className="text-xl font-bold text-white">Braseiro</h1>
                    <p className="text-xs text-[#FF4500]">Nordestino</p>
                </div>
            </div>
        </header>
    );
}
