import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

type RefetchCallback = () => void;

export function useRealtimeOrders(refetch: RefetchCallback) {
    const refetchRef = useRef(refetch);

    // Manter referência atualizada sem causar re-subscribe
    useEffect(() => {
        refetchRef.current = refetch;
    }, [refetch]);

    useEffect(() => {
        console.log('Iniciando subscription real-time para hbn_clientes...');

        const channel = supabase
            .channel('orders-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'hbn_clientes',
                },
                (payload) => {
                    console.log('Evento real-time recebido:', payload.eventType);
                    // Refetch sempre que houver qualquer mudança na tabela
                    refetchRef.current();
                }
            )
            .subscribe((status) => {
                console.log('Status da subscription:', status);
            });

        return () => {
            console.log('Removendo subscription real-time');
            supabase.removeChannel(channel);
        };
    }, []); // Dependências vazias = subscribe uma vez
}
