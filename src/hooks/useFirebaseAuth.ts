import { useState, useEffect, useCallback } from 'react';
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

// Tipos para funcionários
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

interface AuthState {
    user: User | null;
    funcionario: Funcionario | null;
    loading: boolean;
    error: string | null;
}

export function useFirebaseAuth() {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        funcionario: null,
        loading: true,
        error: null,
    });

    // Buscar dados do funcionário no Firestore
    const fetchFuncionario = useCallback(async (user: User): Promise<Funcionario | null> => {
        try {
            const docRef = doc(db, 'funcionarios', user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                    uid: user.uid,
                    nome: data.nome,
                    email: data.email,
                    telefone: data.telefone || '',
                    cargo: data.cargo || null,
                    status: data.status || 'pendente',
                    data_criacao: data.data_criacao?.toDate() || new Date(),
                };
            }
            return null;
        } catch (error) {
            console.error('Erro ao buscar dados do funcionário:', error);
            return null;
        }
    }, []);

    // Escutar mudanças de autenticação
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const funcionario = await fetchFuncionario(user);
                setAuthState({
                    user,
                    funcionario,
                    loading: false,
                    error: null,
                });
            } else {
                setAuthState({
                    user: null,
                    funcionario: null,
                    loading: false,
                    error: null,
                });
            }
        });

        return () => unsubscribe();
    }, [fetchFuncionario]);

    // Login com email/senha
    const signInWithEmail = useCallback(async (email: string, password: string) => {
        setAuthState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const { user } = await signInWithEmailAndPassword(auth, email, password);
            const funcionario = await fetchFuncionario(user);

            // Verificar status do funcionário
            if (funcionario?.status === 'pendente') {
                await firebaseSignOut(auth);
                throw new Error('Seu cadastro ainda está pendente de aprovação pelo administrador.');
            }

            if (funcionario?.status === 'rejeitado') {
                await firebaseSignOut(auth);
                throw new Error('Seu cadastro foi rejeitado. Entre em contato com o administrador.');
            }

            return { user, funcionario };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao fazer login';
            setAuthState((prev) => ({ ...prev, loading: false, error: message }));
            throw error;
        }
    }, [fetchFuncionario]);

    // Login com Google
    const signInWithGoogle = useCallback(async () => {
        setAuthState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const { user } = await signInWithPopup(auth, googleProvider);
            let funcionario = await fetchFuncionario(user);

            // Se não existe registro, criar como pendente
            if (!funcionario) {
                await setDoc(doc(db, 'funcionarios', user.uid), {
                    nome: user.displayName || 'Sem nome',
                    email: user.email,
                    telefone: '',
                    cargo: null,
                    status: 'pendente',
                    data_criacao: serverTimestamp(),
                });
                await firebaseSignOut(auth);
                throw new Error(
                    'Cadastro realizado com sucesso! Aguarde a aprovação do administrador para acessar o sistema.'
                );
            }

            // Verificar status
            if (funcionario.status === 'pendente') {
                await firebaseSignOut(auth);
                throw new Error('Seu cadastro ainda está pendente de aprovação pelo administrador.');
            }

            if (funcionario.status === 'rejeitado') {
                await firebaseSignOut(auth);
                throw new Error('Seu cadastro foi rejeitado. Entre em contato com o administrador.');
            }

            return { user, funcionario };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao fazer login com Google';
            setAuthState((prev) => ({ ...prev, loading: false, error: message }));
            throw error;
        }
    }, [fetchFuncionario]);

    // Registrar novo funcionário
    const signUp = useCallback(
        async (email: string, password: string, nome: string, telefone: string) => {
            setAuthState((prev) => ({ ...prev, loading: true, error: null }));
            try {
                const { user } = await createUserWithEmailAndPassword(auth, email, password);

                // Criar documento do funcionário no Firestore
                await setDoc(doc(db, 'funcionarios', user.uid), {
                    nome,
                    email,
                    telefone,
                    cargo: null, // Admin define o cargo ao aprovar
                    status: 'pendente',
                    data_criacao: serverTimestamp(),
                });

                // Fazer logout - usuário precisa aguardar aprovação
                await firebaseSignOut(auth);

                setAuthState((prev) => ({ ...prev, loading: false }));

                return {
                    success: true,
                    message: 'Cadastro realizado com sucesso! Aguarde a aprovação do administrador.',
                };
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Erro ao criar conta';
                setAuthState((prev) => ({ ...prev, loading: false, error: message }));
                throw error;
            }
        },
        []
    );

    // Logout
    const signOut = useCallback(async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    }, []);

    // Helpers
    const isAdmin = authState.funcionario?.cargo === 'admin';
    const isFuncionario = authState.funcionario?.cargo === 'funcionario';
    const isAuthenticated = !!authState.user && authState.funcionario?.status === 'ativo';

    return {
        user: authState.user,
        funcionario: authState.funcionario,
        loading: authState.loading,
        error: authState.error,
        isAuthenticated,
        isAdmin,
        isFuncionario,
        signInWithEmail,
        signInWithGoogle,
        signUp,
        signOut,
    };
}
