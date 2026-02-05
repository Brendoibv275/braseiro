import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export type PeriodoRelatorio = 'diario' | 'semanal' | 'mensal' | 'trimestral';

export interface DadosRelatorio {
    periodo: PeriodoRelatorio;
    dataInicio: Date;
    dataFim: Date;
    totalVendas: number;
    totalPedidos: number;
    ticketMedio: number;
    pedidosFinalizados: number;
    pedidosCancelados: number;
    vendasPorDia: { data: string; valor: number; pedidos: number }[];
    topProdutos: { nome: string; quantidade: number; valor: number }[];
}

function getDataRange(periodo: PeriodoRelatorio): { inicio: Date; fim: Date } {
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);
    const inicio = new Date(hoje);

    switch (periodo) {
        case 'diario':
            inicio.setHours(0, 0, 0, 0);
            break;
        case 'semanal':
            inicio.setDate(hoje.getDate() - 7);
            inicio.setHours(0, 0, 0, 0);
            break;
        case 'mensal':
            inicio.setMonth(hoje.getMonth() - 1);
            inicio.setHours(0, 0, 0, 0);
            break;
        case 'trimestral':
            inicio.setMonth(hoje.getMonth() - 3);
            inicio.setHours(0, 0, 0, 0);
            break;
    }

    return { inicio, fim: hoje };
}

export function useReports() {
    const [periodo, setPeriodo] = useState<PeriodoRelatorio>('diario');
    const [dados, setDados] = useState<DadosRelatorio | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDados = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const { inicio, fim } = getDataRange(periodo);

            // Buscar do histórico
            const { data: historico, error: histError } = await supabase
                .from('hbn_historico')
                .select('*')
                .gte('data_finalizacao', inicio.toISOString())
                .lte('data_finalizacao', fim.toISOString());

            if (histError) throw histError;

            // Processar dados - considera como finalizados todos que NÃO são cancelados
            const finalizados = (historico || []).filter((p) => p.saida !== 'cancelados');
            const cancelados = (historico || []).filter((p) => p.saida === 'cancelados');

            const totalVendas = finalizados.reduce((sum, p) => sum + (p.valor_gasto || 0), 0);
            const totalPedidos = finalizados.length;
            const ticketMedio = totalPedidos > 0 ? totalVendas / totalPedidos : 0;

            // Agrupar vendas por dia
            const vendasPorDiaMap = new Map<string, { valor: number; pedidos: number }>();
            finalizados.forEach((p) => {
                const data = new Date(p.data_finalizacao).toLocaleDateString('pt-BR');
                const atual = vendasPorDiaMap.get(data) || { valor: 0, pedidos: 0 };
                vendasPorDiaMap.set(data, {
                    valor: atual.valor + (p.valor_gasto || 0),
                    pedidos: atual.pedidos + 1,
                });
            });

            const vendasPorDia = Array.from(vendasPorDiaMap.entries())
                .map(([data, info]) => ({
                    data,
                    valor: info.valor,
                    pedidos: info.pedidos,
                }))
                .sort((a, b) => {
                    const [diaA, mesA, anoA] = a.data.split('/').map(Number);
                    const [diaB, mesB, anoB] = b.data.split('/').map(Number);
                    return new Date(anoA, mesA - 1, diaA).getTime() - new Date(anoB, mesB - 1, diaB).getTime();
                });

            // Top produtos (extrair do resumo do pedido - simplificado)
            const produtosMap = new Map<string, { quantidade: number; valor: number }>();
            finalizados.forEach((p) => {
                const items = (p.ultimo_pedido || '').split(',');
                items.forEach((item: string) => {
                    const match = item.match(/(\d+)x\s+(.+)\s+\(R\$/);
                    if (match) {
                        const quantidade = parseInt(match[1]);
                        const nome = match[2].trim();
                        const atual = produtosMap.get(nome) || { quantidade: 0, valor: 0 };
                        produtosMap.set(nome, {
                            quantidade: atual.quantidade + quantidade,
                            valor: atual.valor + (p.valor_gasto || 0) / items.length,
                        });
                    }
                });
            });

            const topProdutos = Array.from(produtosMap.entries())
                .map(([nome, info]) => ({
                    nome,
                    quantidade: info.quantidade,
                    valor: info.valor,
                }))
                .sort((a, b) => b.quantidade - a.quantidade)
                .slice(0, 5);

            setDados({
                periodo,
                dataInicio: inicio,
                dataFim: fim,
                totalVendas,
                totalPedidos,
                ticketMedio,
                pedidosFinalizados: finalizados.length,
                pedidosCancelados: cancelados.length,
                vendasPorDia,
                topProdutos,
            });
        } catch (err) {
            console.error('Erro ao buscar dados:', err);
            setError('Erro ao carregar dados do relatório');
        } finally {
            setLoading(false);
        }
    }, [periodo]);

    useEffect(() => {
        fetchDados();
    }, [fetchDados]);

    return {
        periodo,
        setPeriodo,
        dados,
        loading,
        error,
        refetch: fetchDados,
    };
}
