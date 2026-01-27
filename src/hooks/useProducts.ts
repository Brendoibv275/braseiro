import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Produto } from '../types';

export function useProducts() {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProdutos() {
            try {
                const { data, error } = await supabase
                    .from('hbn_produtos')
                    .select('*')
                    .eq('disponivel', true)
                    .order('categoria', { ascending: true });

                if (error) throw error;
                setProdutos(data || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao carregar produtos');
            } finally {
                setLoading(false);
            }
        }

        fetchProdutos();
    }, []);

    return { produtos, loading, error };
}
