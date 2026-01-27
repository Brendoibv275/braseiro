import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Pedido, StatusFunil } from '../types';

export function useOrders() {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPedidos = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('hbn_clientes')
                .select('*')
                .in('status_funil', ['anotacao', 'cozinha', 'entrega'])
                .order('data_pedido', { ascending: true });

            if (error) throw error;
            setPedidos(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPedidos();
    }, [fetchPedidos]);

    const criarPedido = async (
        telefone: string,
        nomeCliente: string,
        resumoPedido: string,
        valorTotal: number,
        observacoes?: string
    ) => {
        const { error } = await supabase.from('hbn_clientes').insert({
            telefone,
            nome_cliente: nomeCliente,
            resumo_pedido: resumoPedido,
            observacoes: observacoes || null,
            status_funil: 'anotacao',
            valor_total: valorTotal,
            data_pedido: new Date().toISOString(),
        });

        if (error) throw error;
    };

    const atualizarStatus = async (id: number, novoStatus: StatusFunil) => {
        const { error } = await supabase
            .from('hbn_clientes')
            .update({ status_funil: novoStatus })
            .eq('id', id);

        if (error) throw error;
    };

    // Arquivar pedido via RPC do Supabase
    const finalizarPedido = async (telefone: string) => {
        console.log('Chamando arquivar_pedido_hbn com telefone:', telefone);

        const { data, error } = await supabase.rpc('arquivar_pedido_hbn', {
            p_telefone: telefone,
        });

        console.log('Resultado da RPC:', { data, error });

        if (error) {
            console.error('Erro na RPC:', error);
            throw error;
        }

        // Verificar se a RPC retornou sucesso
        if (data && data.sucesso === false) {
            throw new Error(data.mensagem || 'Erro ao arquivar pedido');
        }

        console.log('Pedido arquivado com sucesso!');
        return data;
    };

    return {
        pedidos,
        loading,
        error,
        criarPedido,
        atualizarStatus,
        finalizarPedido,
        refetch: fetchPedidos,
    };
}
