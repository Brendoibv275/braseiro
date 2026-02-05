import type { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { CargoFuncionario } from '../../contexts/AuthContext';
import { Loader2, ShieldX } from 'lucide-react';

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: CargoFuncionario[];
}

export function ProtectedRoute({ children, allowedRoles = ['admin', 'funcionario'] }: ProtectedRouteProps) {
    const { isAuthenticated, loading, funcionario } = useAuth();

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-[#FF4500] animate-spin" />
            </div>
        );
    }

    // Não autenticado
    if (!isAuthenticated || !funcionario) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <ShieldX className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Acesso Negado</h3>
                <p className="text-[#a1a1aa]">Você precisa estar logado para acessar esta página.</p>
            </div>
        );
    }

    // Verificar cargo
    if (!allowedRoles.includes(funcionario.cargo)) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <ShieldX className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Acesso Restrito</h3>
                <p className="text-[#a1a1aa]">
                    Você não tem permissão para acessar esta página.
                </p>
                <p className="text-[#52525b] text-sm mt-2">
                    Apenas administradores podem ver esta área.
                </p>
            </div>
        );
    }

    return <>{children}</>;
}
