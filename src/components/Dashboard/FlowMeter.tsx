import { ClipboardList, ChefHat, Truck } from 'lucide-react';

interface FlowMeterProps {
    anotacao: number;
    cozinha: number;
    entrega: number;
}

export function FlowMeter({ anotacao, cozinha, entrega }: FlowMeterProps) {
    const total = anotacao + cozinha + entrega;

    const stages = [
        {
            id: 'anotacao',
            label: 'Recebido',
            sublabel: 'Em Anotação',
            count: anotacao,
            icon: ClipboardList,
            color: 'bg-yellow-500',
            bgColor: 'bg-yellow-500/20',
            textColor: 'text-yellow-500',
        },
        {
            id: 'cozinha',
            label: 'Preparando',
            sublabel: 'Na Cozinha',
            count: cozinha,
            icon: ChefHat,
            color: 'bg-blue-500',
            bgColor: 'bg-blue-500/20',
            textColor: 'text-blue-500',
        },
        {
            id: 'entrega',
            label: 'Pronto',
            sublabel: 'Para Entrega',
            count: entrega,
            icon: Truck,
            color: 'bg-green-500',
            bgColor: 'bg-green-500/20',
            textColor: 'text-green-500',
        },
    ];

    return (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">
                Fluxo de Pedidos
                {total > 0 && (
                    <span className="ml-2 text-sm font-normal text-[#a1a1aa]">
                        ({total} em andamento)
                    </span>
                )}
            </h3>

            <div className="flex items-center justify-between gap-4">
                {stages.map((stage, index) => (
                    <div key={stage.id} className="flex-1 flex items-center">
                        {/* Stage card */}
                        <div className="flex-1 text-center">
                            <div
                                className={`w-16 h-16 mx-auto rounded-full ${stage.bgColor} flex items-center justify-center mb-3 relative`}
                            >
                                <stage.icon className={`w-7 h-7 ${stage.textColor}`} />
                                {stage.count > 0 && (
                                    <span
                                        className={`absolute -top-1 -right-1 w-6 h-6 ${stage.color} text-white text-xs font-bold rounded-full flex items-center justify-center`}
                                    >
                                        {stage.count}
                                    </span>
                                )}
                            </div>
                            <p className={`font-semibold ${stage.textColor}`}>{stage.label}</p>
                            <p className="text-xs text-[#a1a1aa]">{stage.sublabel}</p>
                        </div>

                        {/* Arrow connector */}
                        {index < stages.length - 1 && (
                            <div className="flex-shrink-0 px-2">
                                <div className="w-8 h-0.5 bg-[#2a2a2a] relative">
                                    <div
                                        className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-6 border-transparent border-l-[#2a2a2a]"
                                        style={{ borderLeftWidth: '6px' }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Progress bar */}
            {total > 0 && (
                <div className="mt-6">
                    <div className="flex h-2 rounded-full overflow-hidden bg-[#2a2a2a]">
                        {anotacao > 0 && (
                            <div
                                className="bg-yellow-500 transition-all"
                                style={{ width: `${(anotacao / total) * 100}%` }}
                            />
                        )}
                        {cozinha > 0 && (
                            <div
                                className="bg-blue-500 transition-all"
                                style={{ width: `${(cozinha / total) * 100}%` }}
                            />
                        )}
                        {entrega > 0 && (
                            <div
                                className="bg-green-500 transition-all"
                                style={{ width: `${(entrega / total) * 100}%` }}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
