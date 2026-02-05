// Tipos do Braseiro CRM

// Novos tipos para gestão de atendimento
export type StatusPausa = 'humano' | 'ia' | null;
export type StatusImagem = 'recebido' | 'aceito' | null;
export type TipoSaida = 'finalizados' | 'cancelados';
export type TipoOrigem = 'loja' | 'qrcode' | 'delivery';

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
    // Novos campos de orquestração
    pausa?: StatusPausa;
    imagem?: StatusImagem;
    origem?: TipoOrigem;
}

export type StatusFunil = 'anotacao' | 'cozinha' | 'entrega' | 'finalizado';

export const STATUS_LABELS: Record<StatusFunil, string> = {
    anotacao: 'Anotação',
    cozinha: 'Cozinha',
    entrega: 'Entrega',
    finalizado: 'Finalizados',
};

export const CATEGORIAS = ['Hambúrguer', 'Batata', 'Bebida', 'Adicional'] as const;

// Interface para pedidos no histórico
export interface PedidoHistorico {
    id: string;
    telefone: string;
    nome_cliente: string;
    ultimo_pedido: string;
    valor_gasto: number;
    data_finalizacao: string;
    saida: TipoSaida;
}

// Labels para tipos de saída
export const SAIDA_LABELS: Record<TipoSaida, string> = {
    finalizados: 'Finalizado',
    cancelados: 'Cancelado',
};
