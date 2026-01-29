import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { TipoSaida } from '../types';

interface PedidoHistorico {
    id: string;
    telefone: string;
    nome_cliente: string;
    ultimo_pedido: string;
    valor_gasto: number;
    data_finalizacao: string;
    saida: TipoSaida;
}

interface ClienteFrequente {
    telefone: string;
    nome_cliente: string;
    totalPedidos: number;
    totalGasto: number;
}

interface HistoryData {
    pedidos: PedidoHistorico[];
    clientesFrequentes: ClienteFrequente[];
    totalPedidos: number;
    totalVendas: number;
    totalFinalizados: number;
    totalCancelados: number;
}

export function useHistory() {
    const [data, setData] = useState<HistoryData>({
        pedidos: [],
        clientesFrequentes: [],
        totalPedidos: 0,
        totalVendas: 0,
        totalFinalizados: 0,
        totalCancelados: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        try {
            setLoading(true);

            const { data: historico, error: histError } = await supabase
                .from('hbn_historico')
                .select('*')
                .order('data_finalizacao', { ascending: false });

            if (histError) throw histError;

            // Calcular clientes frequentes (apenas finalizados)
            const clientesMap: Record<string, ClienteFrequente> = {};
            const pedidosFinalizados = historico?.filter(p => p.saida !== 'cancelados') || [];
            const pedidosCancelados = historico?.filter(p => p.saida === 'cancelados') || [];

            pedidosFinalizados.forEach((pedido) => {
                const key = pedido.telefone;
                if (!clientesMap[key]) {
                    clientesMap[key] = {
                        telefone: pedido.telefone,
                        nome_cliente: pedido.nome_cliente,
                        totalPedidos: 0,
                        totalGasto: 0,
                    };
                }
                clientesMap[key].totalPedidos++;
                clientesMap[key].totalGasto += pedido.valor_gasto || 0;
            });

            const clientesFrequentes = Object.values(clientesMap)
                .sort((a, b) => b.totalPedidos - a.totalPedidos)
                .slice(0, 10);

            // Total de vendas só conta finalizados
            const totalVendas = pedidosFinalizados.reduce((acc, p) => acc + (p.valor_gasto || 0), 0);

            setData({
                pedidos: historico || [],
                clientesFrequentes,
                totalPedidos: historico?.length || 0,
                totalVendas,
                totalFinalizados: pedidosFinalizados.length,
                totalCancelados: pedidosCancelados.length,
            });

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar histórico');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return { data, loading, error, refetch: fetchHistory };
}
