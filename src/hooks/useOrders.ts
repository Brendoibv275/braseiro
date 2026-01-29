import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Pedido, StatusFunil, StatusPausa, StatusImagem } from '../types';

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
            pausa: null, // Pedido criado na loja
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

    // Reativar atendimento pela IA
    const reativarIA = async (id: number) => {
        console.log('Reativando IA para pedido:', id);
        const { error } = await supabase
            .from('hbn_clientes')
            .update({ pausa: 'ia' as StatusPausa })
            .eq('id', id);

        if (error) {
            console.error('Erro ao reativar IA:', error);
            throw error;
        }
        console.log('IA reativada com sucesso!');
    };

    // Aceitar comprovante de pagamento
    const aceitarPagamento = async (id: number) => {
        console.log('Aceitando pagamento para pedido:', id);
        const { error } = await supabase
            .from('hbn_clientes')
            .update({ imagem: 'aceito' as StatusImagem })
            .eq('id', id);

        if (error) {
            console.error('Erro ao aceitar pagamento:', error);
            throw error;
        }
        console.log('Pagamento aceito com sucesso!');
    };

    // Cancelar pedido - move para histórico com saida='cancelados'
    const cancelarPedido = async (id: number, telefone: string, nomeCliente: string, resumoPedido: string, valorTotal: number) => {
        console.log('Cancelando pedido:', { id, telefone });

        // 1. Inserir no histórico como cancelado
        const { error: insertError } = await supabase.from('hbn_historico').insert({
            telefone,
            nome_cliente: nomeCliente,
            ultimo_pedido: resumoPedido,
            valor_gasto: valorTotal || 0,
            data_finalizacao: new Date().toISOString(),
            saida: 'cancelados',
        });

        if (insertError) {
            console.error('Erro ao inserir no histórico:', insertError);
            throw insertError;
        }

        // 2. Deletar da tabela de clientes ativos
        const { error: deleteError } = await supabase
            .from('hbn_clientes')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Erro ao deletar pedido:', deleteError);
            throw deleteError;
        }

        console.log('Pedido cancelado com sucesso!');
    };

    // Arquivar pedido via RPC do Supabase (finalizado)
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
        reativarIA,
        aceitarPagamento,
        cancelarPedido,
        finalizarPedido,
        refetch: fetchPedidos,
    };
}
