import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Pedido } from '../types';

type RealtimeCallback = (pedidos: Pedido[]) => void;

export function useRealtimeOrders(
    currentPedidos: Pedido[],
    onUpdate: RealtimeCallback
) {
    useEffect(() => {
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
                    if (payload.eventType === 'INSERT') {
                        const newPedido = payload.new as Pedido;
                        if (['anotacao', 'cozinha', 'entrega'].includes(newPedido.status_funil)) {
                            onUpdate([...currentPedidos, newPedido]);
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        const updatedPedido = payload.new as Pedido;
                        if (['anotacao', 'cozinha', 'entrega'].includes(updatedPedido.status_funil)) {
                            const updated = currentPedidos.map((p) =>
                                p.id === updatedPedido.id ? updatedPedido : p
                            );
                            onUpdate(updated);
                        } else {
                            // Pedido foi finalizado, remover da lista
                            onUpdate(currentPedidos.filter((p) => p.id !== updatedPedido.id));
                        }
                    } else if (payload.eventType === 'DELETE') {
                        const deletedId = (payload.old as { id: number }).id;
                        onUpdate(currentPedidos.filter((p) => p.id !== deletedId));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentPedidos, onUpdate]);
}
