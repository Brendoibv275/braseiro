import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, QrCode, ExternalLink } from 'lucide-react';

export function QRCodeGenerator() {
    const [copied, setCopied] = useState(false);

    // URL do cardápio público - usando a URL base atual + /cardapio
    const baseUrl = window.location.origin;
    const cardapioUrl = `${baseUrl}/cardapio`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(cardapioUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Erro ao copiar:', err);
        }
    };

    const handleDownload = () => {
        const svg = document.getElementById('qrcode-cardapio');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = 300;
            canvas.height = 300;
            ctx?.drawImage(img, 0, 0, 300, 300);
            const pngUrl = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = 'qrcode-cardapio-braseiro.png';
            downloadLink.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 items-center">
            {/* QR Code */}
            <div className="bg-white p-4 rounded-xl">
                <QRCodeSVG
                    id="qrcode-cardapio"
                    value={cardapioUrl}
                    size={180}
                    level="H"
                    includeMargin={true}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                />
            </div>

            {/* Informações e ações */}
            <div className="flex-1 space-y-4">
                <div>
                    <h4 className="font-medium text-white mb-2">Cardápio Digital</h4>
                    <p className="text-sm text-[#a1a1aa]">
                        Seus clientes podem escanear este QR Code para ver o cardápio e fazer pedidos diretamente pelo celular.
                    </p>
                </div>

                {/* URL */}
                <div className="flex items-center gap-2 p-3 bg-[#0a0a0a] rounded-lg">
                    <QrCode className="w-4 h-4 text-[#a1a1aa] flex-shrink-0" />
                    <span className="text-sm text-[#a1a1aa] truncate flex-1">{cardapioUrl}</span>
                    <button
                        onClick={handleCopy}
                        className="p-1.5 hover:bg-[#262626] rounded-md transition-colors"
                        title="Copiar link"
                    >
                        {copied ? (
                            <Check className="w-4 h-4 text-green-400" />
                        ) : (
                            <Copy className="w-4 h-4 text-[#a1a1aa]" />
                        )}
                    </button>
                    <a
                        href={cardapioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 hover:bg-[#262626] rounded-md transition-colors"
                        title="Abrir em nova aba"
                    >
                        <ExternalLink className="w-4 h-4 text-[#a1a1aa]" />
                    </a>
                </div>

                {/* Botões */}
                <div className="flex gap-2">
                    <button
                        onClick={handleDownload}
                        className="flex-1 px-4 py-2 bg-[#FF4500] hover:bg-[#E63E00] text-white rounded-lg font-medium transition-colors"
                    >
                        Baixar QR Code
                    </button>
                </div>
            </div>
        </div>
    );
}
