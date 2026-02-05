import { useEffect, useRef, useCallback } from 'react';
import type { Pedido } from '../types';

/**
 * Hook para notificação sonora quando novos pedidos chegam na cozinha.
 * Usa Web Audio API para gerar um beep, funcionando sem arquivo de áudio externo.
 * 
 * @param pedidos - Lista de pedidos atual
 */
export function useOrderNotification(pedidos: Pedido[]) {
    const previousCozinhaIdsRef = useRef<Set<number>>(new Set());
    const audioContextRef = useRef<AudioContext | null>(null);
    const isFirstLoadRef = useRef(true);

    // Criar contexto de áudio uma vez
    const getAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return audioContextRef.current;
    }, []);

    // Função para tocar som de notificação usando Web Audio API
    const playNotificationSound = useCallback(() => {
        try {
            const audioContext = getAudioContext();

            // Criar oscilador para o beep
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Configurar som agradável (frequência de tom de notificação)
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Frequência em Hz
            oscillator.type = 'sine'; // Som suave

            // Envelope de volume (attack, decay)
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05); // Attack
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3); // Decay

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);

            // Segundo beep após 0.15s para efeito de "ding-dong"
            setTimeout(() => {
                const osc2 = audioContext.createOscillator();
                const gain2 = audioContext.createGain();

                osc2.connect(gain2);
                gain2.connect(audioContext.destination);

                osc2.frequency.setValueAtTime(1000, audioContext.currentTime); // Tom mais alto
                osc2.type = 'sine';

                gain2.gain.setValueAtTime(0, audioContext.currentTime);
                gain2.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
                gain2.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.25);

                osc2.start(audioContext.currentTime);
                osc2.stop(audioContext.currentTime + 0.25);
            }, 150);

            console.log('[OrderNotification] 🔔 Som de notificação tocado!');
        } catch (error) {
            console.error('[OrderNotification] Erro ao tocar som:', error);
        }
    }, [getAudioContext]);

    useEffect(() => {
        // Filtrar pedidos na cozinha
        const pedidosCozinha = pedidos.filter(p => p.status_funil === 'cozinha');
        const currentCozinhaIds = new Set(pedidosCozinha.map(p => p.id));

        // Se é o primeiro load, apenas guardar os IDs e sair
        if (isFirstLoadRef.current) {
            previousCozinhaIdsRef.current = currentCozinhaIds;
            isFirstLoadRef.current = false;
            console.log('[OrderNotification] Primeiro load - contagem inicial:', currentCozinhaIds.size);
            return;
        }

        // Verificar se há novos IDs que não existiam antes
        let hasNewOrders = false;
        currentCozinhaIds.forEach(id => {
            if (!previousCozinhaIdsRef.current.has(id)) {
                hasNewOrders = true;
                console.log('[OrderNotification] 🆕 Novo pedido detectado na cozinha! ID:', id);
            }
        });

        // Tocar som se houver novos pedidos
        if (hasNewOrders) {
            playNotificationSound();
        }

        // Atualizar referência
        previousCozinhaIdsRef.current = currentCozinhaIds;
    }, [pedidos, playNotificationSound]);

    // Cleanup ao desmontar
    useEffect(() => {
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);
}
