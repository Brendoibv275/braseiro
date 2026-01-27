import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface PedidoHistorico {
    id: string;
    telefone: string;
    nome_cliente: string;
    ultimo_pedido: string;
    valor_gasto: number;
    data_finalizacao: string;
}

interface StatusCount {
    anotacao: number;
    cozinha: number;
    entrega: number;
}

interface TopProduto {
    nome: string;
    quantidade: number;
}

interface Analytics {
    // Estatísticas do dia
    vendasHoje: number;
    pedidosHoje: number;
    ticketMedio: number;
    // Estatísticas totais
    vendasTotal: number;
    pedidosTotal: number;
    // Contagem por status (fluxo atual)
    statusCount: StatusCount;
    // Top produtos
    topProdutos: TopProduto[];
    // Últimos pedidos finalizados
    ultimosPedidos: PedidoHistorico[];
}

export function useAnalytics() {
    const [analytics, setAnalytics] = useState<Analytics>({
        vendasHoje: 0,
        pedidosHoje: 0,
        ticketMedio: 0,
        vendasTotal: 0,
        pedidosTotal: 0,
        statusCount: { anotacao: 0, cozinha: 0, entrega: 0 },
        topProdutos: [],
        ultimosPedidos: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);

            // 1. Buscar histórico completo
            const { data: historico, error: histError } = await supabase
                .from('hbn_historico')
                .select('*')
                .order('data_finalizacao', { ascending: false });

            if (histError) throw histError;

            // 2. Buscar contagem de status atual
            const { data: clientes, error: clientesError } = await supabase
                .from('hbn_clientes')
                .select('status_funil');

            if (clientesError) throw clientesError;

            // Calcular contagem por status
            const statusCount: StatusCount = {
                anotacao: clientes?.filter(c => c.status_funil === 'anotacao').length || 0,
                cozinha: clientes?.filter(c => c.status_funil === 'cozinha').length || 0,
                entrega: clientes?.filter(c => c.status_funil === 'entrega').length || 0,
            };

            // Calcular estatísticas do histórico
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            const pedidosHoje = historico?.filter(p => {
                const dataFinalizacao = new Date(p.data_finalizacao);
                return dataFinalizacao >= hoje;
            }) || [];

            const vendasHoje = pedidosHoje.reduce((acc, p) => acc + (p.valor_gasto || 0), 0);
            const ticketMedio = pedidosHoje.length > 0 ? vendasHoje / pedidosHoje.length : 0;

            // Calcular top produtos DO DIA
            const produtosContagem: Record<string, number> = {};
            pedidosHoje.forEach(pedido => {
                // Parsear resumo_pedido (formato: "2x Burger, 1x Coca")
                const itens = pedido.ultimo_pedido?.split(', ') || [];
                itens.forEach((item: string) => {
                    const match = item.match(/(\d+)x\s+(.+)/);
                    if (match) {
                        const qtd = parseInt(match[1]);
                        const nome = match[2].trim();
                        produtosContagem[nome] = (produtosContagem[nome] || 0) + qtd;
                    }
                });
            });

            const topProdutos: TopProduto[] = Object.entries(produtosContagem)
                .map(([nome, quantidade]) => ({ nome, quantidade }))
                .sort((a, b) => b.quantidade - a.quantidade)
                .slice(0, 5);

            setAnalytics({
                vendasHoje,
                pedidosHoje: pedidosHoje.length,
                ticketMedio,
                vendasTotal: vendasHoje, // Apenas do dia
                pedidosTotal: pedidosHoje.length, // Apenas do dia
                statusCount,
                topProdutos,
                ultimosPedidos: pedidosHoje.slice(0, 5), // Apenas do dia
            });

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar analytics');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    return { analytics, loading, error, refetch: fetchAnalytics };
}
