import { useEffect, useRef } from 'react';

/**
 * Hook para auto-refresh de dados em intervalos regulares.
 * Ideal para manter páginas atualizadas automaticamente.
 * 
 * @param refetch - Função de refetch a ser executada
 * @param intervalMs - Intervalo em milissegundos (padrão: 5000ms = 5 segundos)
 * @param enabled - Se o polling está ativo (padrão: true)
 */
export function useAutoRefresh(
    refetch: () => void,
    intervalMs: number = 5000,
    enabled: boolean = true
) {
    const refetchRef = useRef(refetch);

    // Manter referência atualizada sem causar re-subscribe do interval
    useEffect(() => {
        refetchRef.current = refetch;
    }, [refetch]);

    useEffect(() => {
        if (!enabled) return;

        console.log(`[AutoRefresh] Iniciando polling a cada ${intervalMs}ms`);

        const interval = setInterval(() => {
            console.log('[AutoRefresh] Executando refetch...');
            refetchRef.current();
        }, intervalMs);

        return () => {
            console.log('[AutoRefresh] Parando polling');
            clearInterval(interval);
        };
    }, [intervalMs, enabled]);
}
