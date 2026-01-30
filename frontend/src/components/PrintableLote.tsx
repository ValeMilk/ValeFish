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
      <div ref={ref} className="p-8 bg-white" style={{ width: '210mm', minHeight: '297mm' }}>
        {/* Header */}
        <div className="border-b-4 border-blue-600 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-600">ValeFish</h1>
              <p className="text-gray-600">Relatório de Lote</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Data de Impressão</p>
              <p className="font-semibold">{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>

        {/* Informações Básicas */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-gray-300 pb-2">
            Informações do Lote
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-xs text-gray-600 mb-1">Número do Lote</p>
              <p className="font-bold text-lg text-blue-900">{lote.numeroLote}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-xs text-gray-600 mb-1">Status</p>
              <p className="font-bold text-lg text-blue-900 capitalize">{lote.status}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-600 mb-1">Fornecedor</p>
              <p className="font-semibold">{lote.fornecedor}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-600 mb-1">Processo</p>
              <p className="font-semibold">{lote.processo}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-600 mb-1">Data de Produção</p>
              <p className="font-semibold">{lote.dataProducao ? new Date(lote.dataProducao).toLocaleDateString('pt-BR') : '-'}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-600 mb-1">Nota Fiscal</p>
              <p className="font-semibold">{lote.numeroNF || '-'}</p>
            </div>
          </div>
        </div>

        {/* Nota Fiscal e Peso */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-gray-300 pb-2">
            Nota Fiscal e Peso
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-100 border-2 border-blue-300 p-3 rounded text-center">
              <p className="text-xs font-medium text-blue-700 mb-1">Total NF</p>
              <p className="text-lg font-bold text-blue-900">{totalNF.toFixed(2)} kg</p>
            </div>
            <div className="bg-green-100 border-2 border-green-300 p-3 rounded text-center">
              <p className="text-xs font-medium text-green-700 mb-1">Total Salão</p>
              <p className="text-lg font-bold text-green-900">{totalSalao.toFixed(2)} kg</p>
            </div>
            <div className={`border-2 p-3 rounded text-center ${
              gap >= 0 ? 'bg-orange-100 border-orange-300' : 'bg-red-100 border-red-300'
            }`}>
              <p className={`text-xs font-medium mb-1 ${gap >= 0 ? 'text-orange-700' : 'text-red-700'}`}>Gap</p>
              <p className={`text-lg font-bold ${gap >= 0 ? 'text-orange-900' : 'text-red-900'}`}>{gap.toFixed(2)} kg</p>
            </div>
          </div>
          
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2 text-left">Tipo</th>
                <th className="border border-gray-300 p-2 text-right">P (kg)</th>
                <th className="border border-gray-300 p-2 text-right">M (kg)</th>
                <th className="border border-gray-300 p-2 text-right">G (kg)</th>
                <th className="border border-gray-300 p-2 text-right">GG (kg)</th>
                <th className="border border-gray-300 p-2 text-right">Total (kg)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 font-medium">Nota Fiscal</td>
                <td className="border border-gray-300 p-2 text-right">{lote.pesoNotaFiscal?.P || 0}</td>
                <td className="border border-gray-300 p-2 text-right">{lote.pesoNotaFiscal?.M || 0}</td>
                <td className="border border-gray-300 p-2 text-right">{lote.pesoNotaFiscal?.G || 0}</td>
                <td className="border border-gray-300 p-2 text-right">{lote.pesoNotaFiscal?.GG || 0}</td>
                <td className="border border-gray-300 p-2 text-right font-bold">{totalNF.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-medium">Salão</td>
                <td className="border border-gray-300 p-2 text-right">{lote.pesoSalao?.P || 0}</td>
                <td className="border border-gray-300 p-2 text-right">{lote.pesoSalao?.M || 0}</td>
                <td className="border border-gray-300 p-2 text-right">{lote.pesoSalao?.G || 0}</td>
                <td className="border border-gray-300 p-2 text-right">{lote.pesoSalao?.GG || 0}</td>
                <td className="border border-gray-300 p-2 text-right font-bold">{totalSalao.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Filetagem */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-gray-300 pb-2">
            Filetagem
          </h2>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-100 border-2 border-blue-300 p-3 rounded text-center">
              <p className="text-xs font-medium text-blue-700 mb-1">In Natura</p>
              <p className="text-lg font-bold text-blue-900">{totalInNatura.toFixed(2)} kg</p>
            </div>
            <div className="bg-cyan-100 border-2 border-cyan-300 p-3 rounded text-center">
              <p className="text-xs font-medium text-cyan-700 mb-1">Congelado</p>
              <p className="text-lg font-bold text-cyan-900">{totalCongelado.toFixed(2)} kg</p>
            </div>
            <div className="bg-green-100 border-2 border-green-300 p-3 rounded text-center">
              <p className="text-xs font-medium text-green-700 mb-1">Diferença</p>
              <p className="text-lg font-bold text-green-900">{diferencaFile.toFixed(2)} kg</p>
            </div>
            <div className="bg-purple-100 border-2 border-purple-300 p-3 rounded text-center">
              <p className="text-xs font-medium text-purple-700 mb-1">Rendimento</p>
              <p className="text-lg font-bold text-purple-900">{rendimento.toFixed(1)}%</p>
            </div>
          </div>

          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2 text-left">Tipo</th>
                <th className="border border-gray-300 p-2 text-right">P (kg)</th>
                <th className="border border-gray-300 p-2 text-right">M (kg)</th>
                <th className="border border-gray-300 p-2 text-right">G (kg)</th>
                <th className="border border-gray-300 p-2 text-right">GG (kg)</th>
                <th className="border border-gray-300 p-2 text-right">Total (kg)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 font-medium">Filé In Natura</td>
                <td className="border border-gray-300 p-2 text-right">{lote.fileInNatura?.P || 0}</td>
                <td className="border border-gray-300 p-2 text-right">{lote.fileInNatura?.M || 0}</td>
                <td className="border border-gray-300 p-2 text-right">{lote.fileInNatura?.G || 0}</td>
                <td className="border border-gray-300 p-2 text-right">{lote.fileInNatura?.GG || 0}</td>
                <td className="border border-gray-300 p-2 text-right font-bold">{totalInNatura.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-medium">Filé Congelado</td>
                <td className="border border-gray-300 p-2 text-right">{lote.fileCongelado?.P || 0}</td>
                <td className="border border-gray-300 p-2 text-right">{lote.fileCongelado?.M || 0}</td>
                <td className="border border-gray-300 p-2 text-right">{lote.fileCongelado?.G || 0}</td>
                <td className="border border-gray-300 p-2 text-right">{lote.fileCongelado?.GG || 0}</td>
                <td className="border border-gray-300 p-2 text-right font-bold">{totalCongelado.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Embalagem */}
        {lote.status === 'finalizado' && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-gray-300 pb-2">
              Embalagem
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600 mb-1">Tipo de Filé</p>
                <p className="font-semibold">{lote.tipoFile || '-'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600 mb-1">Filé Embalado Total</p>
                <p className="font-bold text-lg">{calcularTotal(lote.fileEmbalado).toFixed(2)} kg</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600 mb-1">Caixas</p>
                <p className="font-semibold">{lote.caixas || 0}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600 mb-1">Pacotes</p>
                <p className="font-semibold">{lote.pacotes || 0}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600 mb-1">Data Fabricação</p>
                <p className="font-semibold">{lote.dataFabricacao ? new Date(lote.dataFabricacao).toLocaleDateString('pt-BR') : '-'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600 mb-1">Data Validade</p>
                <p className="font-semibold">{lote.dataValidade ? new Date(lote.dataValidade).toLocaleDateString('pt-BR') : '-'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Valores (apenas finalizados) */}
        {lote.status === 'finalizado' && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-gray-300 pb-2">
              Valores
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-yellow-50 p-3 rounded">
                <p className="text-xs text-gray-600 mb-1">Valor NF</p>
                <p className="font-bold text-xl text-yellow-900">R$ {(lote.valorNF || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <p className="text-xs text-gray-600 mb-1">Aproveitamento NF</p>
                <p className="font-bold text-xl text-green-900">{lote.aprovNotaFiscal || 0}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t-2 border-gray-300 text-center text-sm text-gray-600">
          <p>ValeFish - Sistema de Gestão de Lotes</p>
          <p className="text-xs mt-1">Documento gerado automaticamente em {new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>
    );
  }
);

PrintableLote.displayName = 'PrintableLote';

export default PrintableLote;
