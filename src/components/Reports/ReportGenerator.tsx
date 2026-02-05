import { useState } from 'react';
import {
    Loader2,
    FileText,
    Calendar,
    Download,
    TrendingUp,
    ShoppingBag,
    DollarSign,
    BarChart3,
} from 'lucide-react';
import { useReports } from '../../hooks/useReports';
import type { PeriodoRelatorio, DadosRelatorio } from '../../hooks/useReports';
import jsPDF from 'jspdf';

const PERIODOS: { value: PeriodoRelatorio; label: string }[] = [
    { value: 'diario', label: 'Diário' },
    { value: 'semanal', label: 'Semanal' },
    { value: 'mensal', label: 'Mensal' },
    { value: 'trimestral', label: 'Trimestral' },
];

export function ReportGenerator() {
    const { periodo, setPeriodo, dados, loading, error } = useReports();
    const [generating, setGenerating] = useState(false);

    const formatCurrency = (value: number) =>
        `R$ ${value.toFixed(2).replace('.', ',')}`;

    const formatDate = (date: Date) =>
        date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });

    const generatePDF = async (dados: DadosRelatorio) => {
        setGenerating(true);
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            let y = 20;

            // Logo (carregar como base64)
            try {
                const logo = await loadLogoAsBase64('/logo.png');
                if (logo) {
                    doc.addImage(logo, 'PNG', pageWidth / 2 - 15, y, 30, 30);
                    y += 40;
                }
            } catch (e) {
                console.log('Logo não carregado:', e);
                y += 10;
            }

            // Título
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('BRASEIRO', pageWidth / 2, y, { align: 'center' });
            y += 10;

            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.text('Relatório de Vendas', pageWidth / 2, y, { align: 'center' });
            y += 8;

            // Período
            const periodoLabel = PERIODOS.find((p) => p.value === dados.periodo)?.label || dados.periodo;
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(
                `${periodoLabel} - ${formatDate(dados.dataInicio)} a ${formatDate(dados.dataFim)}`,
                pageWidth / 2,
                y,
                { align: 'center' }
            );
            y += 15;

            // Linha divisória
            doc.setDrawColor(200);
            doc.line(20, y, pageWidth - 20, y);
            y += 15;

            // Resumo
            doc.setTextColor(0);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Resumo', 20, y);
            y += 12;

            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');

            const resumoData = [
                ['Total de Vendas:', formatCurrency(dados.totalVendas)],
                ['Total de Pedidos:', dados.totalPedidos.toString()],
                ['Ticket Médio:', formatCurrency(dados.ticketMedio)],
                ['Pedidos Finalizados:', dados.pedidosFinalizados.toString()],
                ['Pedidos Cancelados:', dados.pedidosCancelados.toString()],
            ];

            resumoData.forEach(([label, value]) => {
                doc.text(label, 25, y);
                doc.setFont('helvetica', 'bold');
                doc.text(value, 100, y);
                doc.setFont('helvetica', 'normal');
                y += 8;
            });

            y += 10;

            // Vendas por dia
            if (dados.vendasPorDia.length > 0) {
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('Vendas por Dia', 20, y);
                y += 10;

                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text('Data', 25, y);
                doc.text('Pedidos', 80, y);
                doc.text('Valor', 120, y);
                y += 6;

                doc.setFont('helvetica', 'normal');
                dados.vendasPorDia.forEach((dia) => {
                    if (y > 270) {
                        doc.addPage();
                        y = 20;
                    }
                    doc.text(dia.data, 25, y);
                    doc.text(dia.pedidos.toString(), 80, y);
                    doc.text(formatCurrency(dia.valor), 120, y);
                    y += 6;
                });
                y += 10;
            }

            // Top produtos
            if (dados.topProdutos.length > 0 && y < 240) {
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('Produtos Mais Vendidos', 20, y);
                y += 10;

                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text('Produto', 25, y);
                doc.text('Qtd', 140, y);
                y += 6;

                doc.setFont('helvetica', 'normal');
                dados.topProdutos.forEach((produto) => {
                    if (y > 270) {
                        doc.addPage();
                        y = 20;
                    }
                    const nome = produto.nome.length > 40 ? produto.nome.substring(0, 40) + '...' : produto.nome;
                    doc.text(nome, 25, y);
                    doc.text(produto.quantidade.toString(), 140, y);
                    y += 6;
                });
            }

            // Rodapé
            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(
                    `Gerado em ${new Date().toLocaleString('pt-BR')} - Página ${i} de ${pageCount}`,
                    pageWidth / 2,
                    290,
                    { align: 'center' }
                );
            }

            // Abrir em nova aba
            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, '_blank');
        } catch (err) {
            console.error('Erro ao gerar PDF:', err);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-[#FF4500]" />
                <h3 className="text-lg font-semibold text-white">Relatórios</h3>
            </div>

            {/* Seletor de período */}
            <div className="flex flex-wrap gap-2 mb-6">
                {PERIODOS.map((p) => (
                    <button
                        key={p.value}
                        onClick={() => setPeriodo(p.value)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${periodo === p.value
                            ? 'bg-[#FF4500] text-white'
                            : 'bg-[#262626] text-[#a1a1aa] hover:text-white'
                            }`}
                    >
                        <Calendar className="w-4 h-4" />
                        {p.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-8 h-8 text-[#FF4500] animate-spin" />
                </div>
            ) : error ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
                    {error}
                </div>
            ) : dados ? (
                <>
                    {/* Cards de resumo */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-[#0a0a0a] rounded-xl p-4">
                            <div className="flex items-center gap-2 text-[#a1a1aa] text-sm mb-1">
                                <DollarSign className="w-4 h-4" />
                                Total Vendas
                            </div>
                            <p className="text-xl font-bold text-white">
                                {formatCurrency(dados.totalVendas)}
                            </p>
                        </div>
                        <div className="bg-[#0a0a0a] rounded-xl p-4">
                            <div className="flex items-center gap-2 text-[#a1a1aa] text-sm mb-1">
                                <ShoppingBag className="w-4 h-4" />
                                Pedidos
                            </div>
                            <p className="text-xl font-bold text-white">{dados.totalPedidos}</p>
                        </div>
                        <div className="bg-[#0a0a0a] rounded-xl p-4">
                            <div className="flex items-center gap-2 text-[#a1a1aa] text-sm mb-1">
                                <TrendingUp className="w-4 h-4" />
                                Ticket Médio
                            </div>
                            <p className="text-xl font-bold text-white">
                                {formatCurrency(dados.ticketMedio)}
                            </p>
                        </div>
                        <div className="bg-[#0a0a0a] rounded-xl p-4">
                            <div className="flex items-center gap-2 text-[#a1a1aa] text-sm mb-1">
                                <BarChart3 className="w-4 h-4" />
                                Cancelados
                            </div>
                            <p className="text-xl font-bold text-white">{dados.pedidosCancelados}</p>
                        </div>
                    </div>

                    {/* Período */}
                    <p className="text-sm text-[#a1a1aa] mb-4">
                        Período: {formatDate(dados.dataInicio)} a {formatDate(dados.dataFim)}
                    </p>

                    {/* Botão de gerar PDF */}
                    <button
                        onClick={() => generatePDF(dados)}
                        disabled={generating}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#FF4500] hover:bg-[#E63E00] disabled:bg-[#FF4500]/50 text-white font-semibold rounded-lg transition-colors"
                    >
                        {generating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Gerando PDF...
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5" />
                                Gerar PDF
                            </>
                        )}
                    </button>
                </>
            ) : null}
        </div>
    );
}

// Helper para carregar logo como base64
async function loadLogoAsBase64(url: string): Promise<string | null> {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
}
