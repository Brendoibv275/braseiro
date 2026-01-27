// Tipos do Braseiro CRM

export interface Produto {
    id: number;
    nome: string;
    descricao: string | null;
    preco: number;
    categoria: 'Hambúrguer' | 'Bebida' | 'Adicional' | 'Batata';
    disponivel: boolean;
}

export interface ItemCarrinho {
    produto: Produto;
    quantidade: number;
}

export interface Pedido {
    id: number;
    telefone: string;
    nome_cliente: string;
    resumo_pedido: string;
    observacoes?: string;
    status_funil: 'novo' | 'anotacao' | 'cozinha' | 'entrega' | 'finalizado';
    data_pedido: string;
    valor_total?: number;
}

export type StatusFunil = 'anotacao' | 'cozinha' | 'entrega' | 'finalizado';

export const STATUS_LABELS: Record<StatusFunil, string> = {
    anotacao: 'Anotação',
    cozinha: 'Cozinha',
    entrega: 'Entrega',
    finalizado: 'Finalizados',
};

export const CATEGORIAS = ['Hambúrguer', 'Batata', 'Bebida', 'Adicional'] as const;
