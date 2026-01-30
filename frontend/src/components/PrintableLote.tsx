import React from 'react';
import { LoteData } from '@/types/lote';

interface PrintableLoteProps {
  lote: LoteData;
}

const PrintableLote = React.forwardRef<HTMLDivElement, PrintableLoteProps>(
  ({ lote }, ref) => {
    const calcularTotal = (peso: any) => {
      if (!peso) return 0;
      return (peso.P || 0) + (peso.M || 0) + (peso.G || 0) + (peso.GG || 0);
    };

    const totalNF = calcularTotal(lote.pesoNotaFiscal);
    const totalSalao = calcularTotal(lote.pesoSalao);
    const gap = totalSalao - totalNF;
    const totalInNatura = calcularTotal(lote.fileInNatura);
    const totalCongelado = calcularTotal(lote.fileCongelado);
    const diferencaFile = totalCongelado - totalInNatura;
    const rendimento = totalInNatura > 0 ? ((totalCongelado / totalInNatura) * 100) : 0;

    return (
      <div ref={ref} className="p-8 bg-white" style={{ width: '210mm', fontSize: '12px' }}>
        <style>{`
          @media print {
            @page {
              size: A4;
              margin: 12mm;
            }
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        `}</style>
        
        {/* Header */}
        <div className="border-b-2 border-blue-600 pb-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/Logo ValeFish.png" 
                alt="ValeFish Logo" 
                style={{ height: '55px', width: 'auto' }}
              />
              <div>
                <h1 className="text-2xl font-bold text-blue-600" style={{ margin: 0 }}>ValeFish</h1>
                <p className="text-gray-600" style={{ fontSize: '11px', margin: 0 }}>Relatório de Lote</p>
              </div>
            </div>
            <div className="text-right">
              <p style={{ fontSize: '10px', margin: 0 }} className="text-gray-600">Data de Impressão</p>
              <p className="font-semibold" style={{ fontSize: '11px', margin: 0 }}>{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>

        {/* Informações Básicas */}
        <div className="mb-4">
          <h2 style={{ fontSize: '14px', margin: '0 0 8px 0' }} className="font-bold text-gray-800 border-b border-gray-300 pb-1">
            Informações do Lote
          </h2>
          <div className="grid grid-cols-2 gap-2" style={{ fontSize: '11px' }}>
            <div className="bg-blue-50 p-2 rounded">
              <p className="text-gray-600 mb-0" style={{ fontSize: '9px' }}>Número do Lote</p>
              <p className="font-bold text-blue-900" style={{ fontSize: '13px', margin: 0 }}>{lote.numeroLote}</p>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <p className="text-gray-600 mb-0" style={{ fontSize: '9px' }}>Status</p>
              <p className="font-bold text-blue-900 capitalize" style={{ fontSize: '13px', margin: 0 }}>{lote.status}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-600 mb-0" style={{ fontSize: '9px' }}>Fornecedor</p>
              <p className="font-semibold" style={{ fontSize: '11px', margin: 0 }}>{lote.fornecedor}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-600 mb-0" style={{ fontSize: '9px' }}>Processo</p>
              <p className="font-semibold" style={{ fontSize: '11px', margin: 0 }}>{lote.processo}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-600 mb-0" style={{ fontSize: '9px' }}>Data de Produção</p>
              <p className="font-semibold" style={{ fontSize: '11px', margin: 0 }}>{lote.dataProducao ? new Date(lote.dataProducao).toLocaleDateString('pt-BR') : '-'}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-600 mb-0" style={{ fontSize: '9px' }}>Nota Fiscal</p>
              <p className="font-semibold" style={{ fontSize: '11px', margin: 0 }}>{lote.numeroNF || '-'}</p>
            </div>
          </div>
        </div>

        {/* Nota Fiscal e Peso */}
        <div className="mb-4">
          <h2 style={{ fontSize: '14px', margin: '0 0 8px 0' }} className="font-bold text-gray-800 border-b border-gray-300 pb-1">
            Nota Fiscal e Peso
          </h2>
          <div className="grid grid-cols-3 gap-2 mb-2" style={{ fontSize: '11px' }}>
            <div className="bg-blue-100 border border-blue-300 p-2 rounded text-center">
              <p className="font-medium text-blue-700 mb-0" style={{ fontSize: '9px' }}>Total NF</p>
              <p className="font-bold text-blue-900" style={{ fontSize: '13px', margin: 0 }}>{totalNF.toFixed(2)} kg</p>
            </div>
            <div className="bg-green-100 border border-green-300 p-2 rounded text-center">
              <p className="font-medium text-green-700 mb-0" style={{ fontSize: '9px' }}>Total Salão</p>
              <p className="font-bold text-green-900" style={{ fontSize: '13px', margin: 0 }}>{totalSalao.toFixed(2)} kg</p>
            </div>
            <div className={`border p-2 rounded text-center ${
              gap >= 0 ? 'bg-orange-100 border-orange-300' : 'bg-red-100 border-red-300'
            }`}>
              <p className={`font-medium mb-0 ${gap >= 0 ? 'text-orange-700' : 'text-red-700'}`} style={{ fontSize: '9px' }}>Gap</p>
              <p className={`font-bold ${gap >= 0 ? 'text-orange-900' : 'text-red-900'}`} style={{ fontSize: '13px', margin: 0 }}>{gap.toFixed(2)} kg</p>
            </div>
          </div>
          
          <table className="w-full border-collapse border border-gray-300" style={{ fontSize: '10px' }}>
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-1 text-left">Tipo</th>
                <th className="border border-gray-300 p-1 text-right">P (kg)</th>
                <th className="border border-gray-300 p-1 text-right">M (kg)</th>
                <th className="border border-gray-300 p-1 text-right">G (kg)</th>
                <th className="border border-gray-300 p-1 text-right">GG (kg)</th>
                <th className="border border-gray-300 p-1 text-right">Total (kg)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-1 font-medium">Nota Fiscal</td>
                <td className="border border-gray-300 p-1 text-right">{lote.pesoNotaFiscal?.P || 0}</td>
                <td className="border border-gray-300 p-1 text-right">{lote.pesoNotaFiscal?.M || 0}</td>
                <td className="border border-gray-300 p-1 text-right">{lote.pesoNotaFiscal?.G || 0}</td>
                <td className="border border-gray-300 p-1 text-right">{lote.pesoNotaFiscal?.GG || 0}</td>
                <td className="border border-gray-300 p-1 text-right font-bold">{totalNF.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-1 font-medium">Salão</td>
                <td className="border border-gray-300 p-1 text-right">{lote.pesoSalao?.P || 0}</td>
                <td className="border border-gray-300 p-1 text-right">{lote.pesoSalao?.M || 0}</td>
                <td className="border border-gray-300 p-1 text-right">{lote.pesoSalao?.G || 0}</td>
                <td className="border border-gray-300 p-1 text-right">{lote.pesoSalao?.GG || 0}</td>
                <td className="border border-gray-300 p-1 text-right font-bold">{totalSalao.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Filetagem */}
        <div className="mb-4">
          <h2 style={{ fontSize: '14px', margin: '0 0 8px 0' }} className="font-bold text-gray-800 border-b border-gray-300 pb-1">
            Filetagem
          </h2>
          <div className="grid grid-cols-4 gap-2 mb-2" style={{ fontSize: '11px' }}>
            <div className="bg-blue-100 border border-blue-300 p-2 rounded text-center">
              <p className="font-medium text-blue-700 mb-0" style={{ fontSize: '9px' }}>In Natura</p>
              <p className="font-bold text-blue-900" style={{ fontSize: '13px', margin: 0 }}>{totalInNatura.toFixed(2)} kg</p>
            </div>
            <div className="bg-cyan-100 border border-cyan-300 p-2 rounded text-center">
              <p className="font-medium text-cyan-700 mb-0" style={{ fontSize: '9px' }}>Congelado</p>
              <p className="font-bold text-cyan-900" style={{ fontSize: '13px', margin: 0 }}>{totalCongelado.toFixed(2)} kg</p>
            </div>
            <div className="bg-green-100 border border-green-300 p-2 rounded text-center">
              <p className="font-medium text-green-700 mb-0" style={{ fontSize: '9px' }}>Diferença</p>
              <p className="font-bold text-green-900" style={{ fontSize: '13px', margin: 0 }}>{diferencaFile.toFixed(2)} kg</p>
            </div>
            <div className="bg-purple-100 border border-purple-300 p-2 rounded text-center">
              <p className="font-medium text-purple-700 mb-0" style={{ fontSize: '9px' }}>Rendimento</p>
              <p className="font-bold text-purple-900" style={{ fontSize: '13px', margin: 0 }}>{rendimento.toFixed(1)}%</p>
            </div>
          </div>

          <table className="w-full border-collapse border border-gray-300" style={{ fontSize: '10px' }}>
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-1 text-left">Tipo</th>
                <th className="border border-gray-300 p-1 text-right">P (kg)</th>
                <th className="border border-gray-300 p-1 text-right">M (kg)</th>
                <th className="border border-gray-300 p-1 text-right">G (kg)</th>
                <th className="border border-gray-300 p-1 text-right">GG (kg)</th>
                <th className="border border-gray-300 p-1 text-right">Total (kg)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-1 font-medium">Filé In Natura</td>
                <td className="border border-gray-300 p-1 text-right">{lote.fileInNatura?.P || 0}</td>
                <td className="border border-gray-300 p-1 text-right">{lote.fileInNatura?.M || 0}</td>
                <td className="border border-gray-300 p-1 text-right">{lote.fileInNatura?.G || 0}</td>
                <td className="border border-gray-300 p-1 text-right">{lote.fileInNatura?.GG || 0}</td>
                <td className="border border-gray-300 p-1 text-right font-bold">{totalInNatura.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-1 font-medium">Filé Congelado</td>
                <td className="border border-gray-300 p-1 text-right">{lote.fileCongelado?.P || 0}</td>
                <td className="border border-gray-300 p-1 text-right">{lote.fileCongelado?.M || 0}</td>
                <td className="border border-gray-300 p-1 text-right">{lote.fileCongelado?.G || 0}</td>
                <td className="border border-gray-300 p-1 text-right">{lote.fileCongelado?.GG || 0}</td>
                <td className="border border-gray-300 p-1 text-right font-bold">{totalCongelado.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Embalagem */}
        {lote.status === 'finalizado' && (
          <div className="mb-4">
            <h2 style={{ fontSize: '14px', margin: '0 0 8px 0' }} className="font-bold text-gray-800 border-b border-gray-300 pb-1">
              Embalagem
            </h2>
            <div className="grid grid-cols-3 gap-2" style={{ fontSize: '11px' }}>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-600 mb-0" style={{ fontSize: '9px' }}>Tipo de Filé</p>
                <p className="font-semibold" style={{ margin: 0 }}>{lote.tipoFile || '-'}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-600 mb-0" style={{ fontSize: '8px' }}>Filé Embalado Total</p>
                <p className="font-bold" style={{ fontSize: '11px', margin: 0 }}>{calcularTotal(lote.fileEmbalado).toFixed(2)} kg</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-600 mb-0" style={{ fontSize: '8px' }}>Caixas / Pacotes</p>
                <p className="font-semibold" style={{ margin: 0 }}>{lote.caixas || 0} / {lote.pacotes || 0}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-600 mb-0" style={{ fontSize: '8px' }}>Data Fabricação</p>
                <p className="font-semibold" style={{ margin: 0 }}>{lote.dataFabricacao ? new Date(lote.dataFabricacao).toLocaleDateString('pt-BR') : '-'}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-600 mb-0" style={{ fontSize: '9px' }}>Data Validade</p>
                <p className="font-semibold" style={{ fontSize: '11px', margin: 0 }}>{lote.dataValidade ? new Date(lote.dataValidade).toLocaleDateString('pt-BR') : '-'}</p>
              </div>
              <div className="bg-yellow-50 p-2 rounded">
                <p className="text-gray-600 mb-0" style={{ fontSize: '9px' }}>Valor NF</p>
                <p className="font-bold text-yellow-900" style={{ fontSize: '13px', margin: 0 }}>R$ {(lote.valorNF || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-2 border-t border-gray-300 text-center" style={{ fontSize: '10px' }}>
          <p className="text-gray-600" style={{ margin: 0 }}>ValeFish - Sistema de Gestão de Lotes</p>
          <p className="text-gray-500" style={{ fontSize: '9px', margin: '2px 0 0 0' }}>Documento gerado automaticamente em {new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>
    );
  }
);

PrintableLote.displayName = 'PrintableLote';

export default PrintableLote;
