import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import type { Funcionario, CargoFuncionario } from '../hooks/useFirebaseAuth';
import type { User } from 'firebase/auth';

interface AuthContextType {
    user: User | null;
    funcionario: Funcionario | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isFuncionario: boolean;
    cargo: CargoFuncionario;
    signInWithEmail: (email: string, password: string) => Promise<{ user: User; funcionario: Funcionario | null }>;
    signInWithGoogle: () => Promise<{ user: User; funcionario: Funcionario | null }>;
    signUp: (email: string, password: string, nome: string, telefone: string) => Promise<{ success: boolean; message: string }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const auth = useFirebaseAuth();

    const value: AuthContextType = {
        ...auth,
        cargo: auth.funcionario?.cargo || null,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export type { AuthContextType, CargoFuncionario, Funcionario };
