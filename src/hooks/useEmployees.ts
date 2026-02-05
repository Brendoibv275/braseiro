import { useState, useEffect, useCallback } from 'react';
import {
    collection,
    doc,
    updateDoc,
    query,
    orderBy,
    onSnapshot,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Tipos
export type CargoFuncionario = 'admin' | 'funcionario' | null;
export type StatusFuncionario = 'ativo' | 'pendente' | 'rejeitado';

export interface Funcionario {
    uid: string;
    nome: string;
    email: string;
    telefone: string;
    cargo: CargoFuncionario;
    status: StatusFuncionario;
    data_criacao: Date;
}

export function useEmployees() {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Carregar funcionários em tempo real
    useEffect(() => {
        const q = query(
            collection(db, 'funcionarios'),
            orderBy('data_criacao', 'desc')
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const data: Funcionario[] = [];
                snapshot.forEach((doc) => {
                    const docData = doc.data();
                    data.push({
                        uid: doc.id,
                        nome: docData.nome || 'Sem nome',
                        email: docData.email || '',
                        telefone: docData.telefone || '',
                        cargo: docData.cargo || null,
                        status: docData.status || 'pendente',
                        data_criacao: docData.data_criacao instanceof Timestamp
                            ? docData.data_criacao.toDate()
                            : new Date(),
                    });
                });
                setFuncionarios(data);
                setLoading(false);
            },
            (err) => {
                console.error('Erro ao carregar funcionários:', err);
                setError('Erro ao carregar funcionários');
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // Aprovar funcionário
    const aprovarFuncionario = useCallback(
        async (uid: string, cargo: 'admin' | 'funcionario') => {
            try {
                await updateDoc(doc(db, 'funcionarios', uid), {
                    status: 'ativo',
                    cargo,
                });
                return { success: true };
            } catch (err) {
                console.error('Erro ao aprovar funcionário:', err);
                throw new Error('Erro ao aprovar funcionário');
            }
        },
        []
    );

    // Rejeitar funcionário
    const rejeitarFuncionario = useCallback(async (uid: string) => {
        try {
            await updateDoc(doc(db, 'funcionarios', uid), {
                status: 'rejeitado',
                cargo: null,
            });
            return { success: true };
        } catch (err) {
            console.error('Erro ao rejeitar funcionário:', err);
            throw new Error('Erro ao rejeitar funcionário');
        }
    }, []);

    // Alterar cargo do funcionário
    const alterarCargo = useCallback(
        async (uid: string, novoCargo: 'admin' | 'funcionario') => {
            try {
                await updateDoc(doc(db, 'funcionarios', uid), {
                    cargo: novoCargo,
                });
                return { success: true };
            } catch (err) {
                console.error('Erro ao alterar cargo:', err);
                throw new Error('Erro ao alterar cargo');
            }
        },
        []
    );

    // Desativar funcionário
    const desativarFuncionario = useCallback(async (uid: string) => {
        try {
            await updateDoc(doc(db, 'funcionarios', uid), {
                status: 'rejeitado',
            });
            return { success: true };
        } catch (err) {
            console.error('Erro ao desativar funcionário:', err);
            throw new Error('Erro ao desativar funcionário');
        }
    }, []);

    // Reativar funcionário
    const reativarFuncionario = useCallback(async (uid: string) => {
        try {
            await updateDoc(doc(db, 'funcionarios', uid), {
                status: 'ativo',
            });
            return { success: true };
        } catch (err) {
            console.error('Erro ao reativar funcionário:', err);
            throw new Error('Erro ao reativar funcionário');
        }
    }, []);

    // Filtros
    const pendentes = funcionarios.filter((f) => f.status === 'pendente');
    const ativos = funcionarios.filter((f) => f.status === 'ativo');
    const rejeitados = funcionarios.filter((f) => f.status === 'rejeitado');

    return {
        funcionarios,
        pendentes,
        ativos,
        rejeitados,
        loading,
        error,
        aprovarFuncionario,
        rejeitarFuncionario,
        alterarCargo,
        desativarFuncionario,
        reativarFuncionario,
    };
}
