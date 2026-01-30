import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useBotConfig() {
    const [botAtivo, setBotAtivo] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Buscar configuração inicial
    const fetchConfig = async () => {
        try {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from('hbn_configuracoes')
                .select('*')
                .eq('chave', 'bot_ativo')
                .single();

            if (fetchError) throw fetchError;

            setBotAtivo(data?.valor_booleano ?? false);
            setError(null);
        } catch (err) {
            console.error('Erro ao buscar configuração do bot:', err);
            setError('Erro ao carregar status do bot');
            setBotAtivo(false);
        } finally {
            setLoading(false);
        }
    };

    // Alternar status do bot
    const toggleBot = async () => {
        if (botAtivo === null || updating) return;

        const novoStatus = !botAtivo;

        try {
            setUpdating(true);
            // Atualização otimista
            setBotAtivo(novoStatus);

            const { error: updateError } = await supabase
                .from('hbn_configuracoes')
                .update({
                    valor_booleano: novoStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('chave', 'bot_ativo');

            if (updateError) throw updateError;

            setError(null);
        } catch (err) {
            console.error('Erro ao atualizar status do bot:', err);
            // Reverter em caso de erro
            setBotAtivo(!novoStatus);
            setError('Erro ao atualizar status do bot');
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        fetchConfig();

        // Inscrever para mudanças em tempo real
        const channel = supabase
            .channel('bot-config-changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'hbn_configuracoes',
                    filter: 'chave=eq.bot_ativo'
                },
                (payload) => {
                    console.log('Configuração do bot atualizada:', payload);
                    setBotAtivo(payload.new.valor_booleano);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return {
        botAtivo,
        loading,
        updating,
        error,
        toggleBot,
        refetch: fetchConfig
    };
}
