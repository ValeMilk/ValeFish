import React from 'react';
import { LoteData } from '@/types/lote';
import { QRCodeSVG } from 'qrcode.react';

interface PrintableLoteProps {
  lote: LoteData;
  username?: string;
}

const PrintableLote = React.forwardRef<HTMLDivElement, PrintableLoteProps>(
  ({ lote, username }, ref) => {
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
    const rendimento = totalInNatura > 0 ? (((totalCongelado / totalInNatura) - 1) * 100) : 0;

    // Função de arredondamento preciso para evitar erros de ponto flutuante
    const arredondar = (valor: number, casas: number = 2): number => {
      const multiplicador = Math.pow(10, casas);
      return Math.round(valor * multiplicador) / multiplicador;
    };

    // Calcular custos de embalagem
    const calcularCustos = () => {
      const tipoFile = lote.tipoFile || '400g';
      const caixas = lote.caixas || lote.qtdMaster || 0;
      const pacotes = lote.pacotes || lote.qtdSacos || 0;
      const pacotesPorCaixa = tipoFile === '800g' ? 12 : 24;
      const totalPacotes = caixas * pacotesPorCaixa + pacotes;
      const totalCaixas = pacotes / pacotesPorCaixa + caixas;
      
      const custoPorPacote = tipoFile === '400g' ? 0.4295 : 0.5515;
      const custoPacotes = totalPacotes * custoPorPacote;
      const custoCaixas = totalCaixas * 6.05;
      
      return { custoPacotes, custoCaixas };
    };
    
    const custos = calcularCustos();

    // Calcular tabela de análise de custos
    const calcularTabelaCustos = () => {
      const tipoFile = lote.tipoFile || '400g';
      const caixas = lote.caixas || lote.qtdMaster || 0;
      const pacotes = lote.pacotes || lote.qtdSacos || 0;
      const pacotesPorCaixa = tipoFile === '800g' ? 12 : 24;
      const totalPacotes = caixas * pacotesPorCaixa + pacotes;
      const totalCaixas = pacotes / pacotesPorCaixa + caixas;
      const fileEmbalado = calcularTotal(lote.fileEmbalado);
      const valorNF = lote.valorNF || 0;
      
      if (totalPacotes === 0 || fileEmbalado === 0 || totalCaixas === 0 || valorNF === 0) {
        return null;
      }
      
      // FILÉ
      const filePacket = arredondar(valorNF / totalPacotes);
      const fileKg = arredondar(valorNF / fileEmbalado);
      const fileBox = arredondar(valorNF / totalCaixas);
      
      // EMBALAGEM
      const custoPacoteBase = tipoFile === '400g' ? 0.4295 : 0.5515;
      const embalagemPacket = arredondar(custoPacoteBase + (6.05 / 24));
      const divisorKg = tipoFile === '400g' ? 4 : 8;
      const embalagemKg = arredondar((embalagemPacket / divisorKg) * 10);
      const embalagemBox = arredondar(embalagemKg * 9.6);
      
      // SERVIÇO
      const multiplicadorServico = tipoFile === '400g' ? 4 : 8;
      const servicoPacket = arredondar((6 / 10) * multiplicadorServico);
      const servicoKg = 6.00;
      const servicoBox = 57.60;
      
      // TOTAL
      const totalPacket = arredondar(filePacket + embalagemPacket + servicoPacket);
      const totalKg = arredondar(fileKg + embalagemKg + servicoKg);
      const totalBox = arredondar(fileBox + embalagemBox + servicoBox);
      
      return {
        custoFile: { pacote: filePacket, kg: fileKg, caixa: fileBox },
        custoEmbalagem: { pacote: embalagemPacket, kg: embalagemKg, caixa: embalagemBox },
        custoServico: { pacote: servicoPacket, kg: servicoKg, caixa: servicoBox },
        custoTotal: { pacote: totalPacket, kg: totalKg, caixa: totalBox }
      };
    };
    
    const tabelaCustos = lote.custoFile && lote.custoEmbalagem && lote.custoServico && lote.custoTotal
      ? { custoFile: lote.custoFile, custoEmbalagem: lote.custoEmbalagem, custoServico: lote.custoServico, custoTotal: lote.custoTotal }
      : calcularTabelaCustos();

    return (
      <div ref={ref} className="p-6 bg-white" style={{ width: '210mm', fontSize: '12px', lineHeight: '1.4' }}>
        <style>{`
          @media print {
            @page {
              size: A4;
              margin: 10mm;
            }}
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        `}</style>
        
        {/* Header */}
        <div className="border-b-2 border-blue-600 pb-3 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/Logo ValeFish.png" 
                alt="ValeFish Logo" 
                style={{ height: '60px', width: 'auto' }}
              />
            </div>
            <div className="flex items-center gap-3">
              {/* QR Code */}
              <div className="text-center">
                <QRCodeSVG 
                  value={`http://72.61.62.17:8888/lote/${lote.id || (lote as any)._id || ''}`}
                  size={75}
                  level="M"
                  includeMargin={false}
                />
                <p style={{ fontSize: '9px', margin: '3px 0 0 0' }} className="text-gray-500">Lote {lote.numeroLote}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informações Básicas */}
        <div className="mb-3">
          <h2 style={{ fontSize: '14px', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }} className="font-bold text-gray-800 border-b border-gray-300 pb-1">
            Informações do Lote
          </h2>
          <div className="grid grid-cols-6 gap-2" style={{ fontSize: '11px' }}>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-600 mb-0" style={{ fontSize: '9px' }}>Data Produção</p>
              <p className="font-semibold" style={{ fontSize: '12px', margin: 0 }}>{lote.dataProducao ? new Date(lote.dataProducao).toLocaleDateString('pt-BR') : '-'}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-600 mb-0" style={{ fontSize: '9px' }}>Processo</p>
              <p className="font-semibold" style={{ fontSize: '12px', margin: 0 }}>{lote.processo}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-600 mb-0" style={{ fontSize: '9px' }}>Fornecedor</p>
              <p className="font-semibold" style={{ fontSize: '12px', margin: 0 }}>{lote.fornecedor}</p>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <p className="text-gray-600 mb-0" style={{ fontSize: '9px' }}>Nº Lote</p>
              <p className="font-bold text-blue-900" style={{ fontSize: '13px', margin: 0 }}>{lote.numeroLote}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-600 mb-0" style={{ fontSize: '9px' }}>Nota Fiscal</p>
              <p className="font-semibold" style={{ fontSize: '12px', margin: 0 }}>{lote.numeroNF || '-'}</p>
            </div>
            <div className="bg-yellow-50 p-2 rounded">
              <p className="text-gray-600 mb-0" style={{ fontSize: '9px' }}>Valor Transferência</p>
              <p className="font-bold text-yellow-900" style={{ fontSize: '13px', margin: 0 }}>R$ {(lote.valorNF || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        {/* Nota Fiscal e Peso */}
        <div className="mb-3">
          <h2 style={{ fontSize: '13px', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }} className="font-bold text-gray-800 border-b border-gray-300 pb-1">
            Nota Fiscal e Peso
          </h2>
          <div className="flex gap-2 mb-2" style={{ fontSize: '11px' }}>
            <div className="bg-blue-100 border border-blue-300 p-2 rounded text-center flex-1">
              <p className="font-medium text-blue-700 mb-0" style={{ fontSize: '10px' }}>Total NF</p>
              <p className="font-bold text-blue-900" style={{ fontSize: '14px', margin: 0 }}>{totalNF.toFixed(2)} kg</p>
            </div>
            <div className="bg-green-100 border border-green-300 p-2 rounded text-center flex-1">
              <p className="font-medium text-green-700 mb-0" style={{ fontSize: '10px' }}>Total Salão</p>
              <p className="font-bold text-green-900" style={{ fontSize: '14px', margin: 0 }}>{totalSalao.toFixed(2)} kg</p>
            </div>
            <div className={`border p-2 rounded text-center flex-1 ${
              gap >= 0 ? 'bg-orange-100 border-orange-300' : 'bg-red-100 border-red-300'
            }`}>
              <p className={`font-medium mb-0 ${gap >= 0 ? 'text-orange-700' : 'text-red-700'}`} style={{ fontSize: '10px' }}>Gap</p>
              <p className={`font-bold ${gap >= 0 ? 'text-orange-900' : 'text-red-900'}`} style={{ fontSize: '14px', margin: 0 }}>{gap.toFixed(2)} kg</p>
            </div>
          </div>
          
          <table className="w-full border-collapse border border-gray-300" style={{ fontSize: '11px' }}>
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2 text-left" style={{ fontSize: '10px', textTransform: 'uppercase' }}>Tipo</th>
                <th className="border border-gray-300 p-2 text-right" style={{ fontSize: '10px', textTransform: 'uppercase' }}>P (kg)</th>
                <th className="border border-gray-300 p-2 text-right" style={{ fontSize: '10px', textTransform: 'uppercase' }}>M (kg)</th>
                <th className="border border-gray-300 p-2 text-right" style={{ fontSize: '10px', textTransform: 'uppercase' }}>G (kg)</th>
                <th className="border border-gray-300 p-2 text-right" style={{ fontSize: '10px', textTransform: 'uppercase' }}>GG (kg)</th>

              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 font-medium">Nota Fiscal</td>
                <td className="border border-gray-300 p-2 text-right">{lote.pesoNotaFiscal?.P || 0}</td>
                <td className="border border-gray-300 p-2 text-right">{lote.pesoNotaFiscal?.M || 0}</td>
                <td className="border border-gray-300 p-2 text-right">{lote.pesoNotaFiscal?.G || 0}</td>
                <td className="border border-gray-300 p-2 text-right">{lote.pesoNotaFiscal?.GG || 0}</td>

              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-medium">Salão</td>
                <td className="border border-gray-300 p-2 text-right">{lote.pesoSalao?.P || 0}</td>
                <td className="border border-gray-300 p-2 text-right">{lote.pesoSalao?.M || 0}</td>
                <td className="border border-gray-300 p-2 text-right">{lote.pesoSalao?.G || 0}</td>
                <td className="border border-gray-300 p-2 text-right">{lote.pesoSalao?.GG || 0}</td>

              </tr>
            </tbody>
          </table>
        </div>

        {/* Filetagem */}
        <div className="mb-3">
          <h2 style={{ fontSize: '13px', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }} className="font-bold text-gray-800 border-b border-gray-300 pb-1">
            Filetagem
          </h2>
          <div className="flex gap-2 mb-2" style={{ fontSize: '11px' }}>
            <div className="bg-blue-100 border border-blue-300 p-2 rounded text-center flex-1">
              <p className="font-medium text-blue-700 mb-0" style={{ fontSize: '10px' }}>In Natura</p>
              <p className="font-bold text-blue-900" style={{ fontSize: '14px', margin: 0 }}>{totalInNatura.toFixed(2)} kg</p>
            </div>
            <div className="bg-cyan-100 border border-cyan-300 p-2 rounded text-center flex-1">
              <p className="font-medium text-cyan-700 mb-0" style={{ fontSize: '10px' }}>Congelado</p>
              <p className="font-bold text-cyan-900" style={{ fontSize: '14px', margin: 0 }}>{totalCongelado.toFixed(2)} kg</p>
            </div>
            <div className="bg-green-100 border border-green-300 p-2 rounded text-center flex-1">
              <p className="font-medium text-green-700 mb-0" style={{ fontSize: '10px' }}>Diferença</p>
              <p className="font-bold text-green-900" style={{ fontSize: '14px', margin: 0 }}>{diferencaFile.toFixed(2)} kg</p>
            </div>
            <div className="bg-purple-100 border border-purple-300 p-2 rounded text-center flex-1">
              <p className="font-medium text-purple-700 mb-0" style={{ fontSize: '10px' }}>Rendimento</p>
              <p className="font-bold text-purple-900" style={{ fontSize: '14px', margin: 0 }}>{rendimento.toFixed(1)}%</p>
            </div>
          </div>

          <table className="w-full border-collapse border border-gray-300" style={{ fontSize: '11px' }}>
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2 text-left" style={{ fontSize: '10px', textTransform: 'uppercase' }}>Tipo</th>
                <th className="border border-gray-300 p-2 text-right" style={{ fontSize: '10px', textTransform: 'uppercase' }}>P (kg)</th>
                <th className="border border-gray-300 p-2 text-right" style={{ fontSize: '10px', textTransform: 'uppercase' }}>M (kg)</th>
                <th className="border border-gray-300 p-2 text-right" style={{ fontSize: '10px', textTransform: 'uppercase' }}>G (kg)</th>
                <th className="border border-gray-300 p-2 text-right" style={{ fontSize: '10px', textTransform: 'uppercase' }}>GG (kg)</th>

              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 font-medium">Filé In Natura</td>
                <td className="border border-gray-300 p-2 text-right">{lote.fileInNatura?.P || 0}</td>
                <td className="border border-gray-300 p-2 text-right">{lote.fileInNatura?.M || 0}</td>
                <td className="border border-gray-300 p-2 text-right">{lote.fileInNatura?.G || 0}</td>
                <td className="border border-gray-300 p-2 text-right">{lote.fileInNatura?.GG || 0}</td>

              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-medium">Filé Congelado</td>
                <td className="border border-gray-300 p-2 text-right">{lote.fileCongelado?.P || 0}</td>
                <td className="border border-gray-300 p-2 text-right">{lote.fileCongelado?.M || 0}</td>
                <td className="border border-gray-300 p-2 text-right">{lote.fileCongelado?.G || 0}</td>
                <td className="border border-gray-300 p-2 text-right">{lote.fileCongelado?.GG || 0}</td>

              </tr>
            </tbody>
          </table>
        </div>

        {/* Embalagem */}
        {lote.status === 'finalizado' && (
          <div className="mb-3">
            <h2 style={{ fontSize: '13px', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }} className="font-bold text-gray-800 border-b border-gray-300 pb-1">
              Embalagem
            </h2>
            <div className="grid grid-cols-4 gap-2" style={{ fontSize: '11px' }}>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-600 mb-0" style={{ fontSize: '9px' }}>Tipo Filé</p>
                <p className="font-semibold" style={{ margin: 0, fontSize: '11px' }}>{lote.tipoFile || '-'}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-600 mb-0" style={{ fontSize: '9px' }}>Total Pacotes</p>
                <p className="font-bold" style={{ fontSize: '12px', margin: 0 }}>
                  {(() => {
                    const tipoFile = lote.tipoFile || '400g';
                    const caixas = lote.caixas || lote.qtdMaster || 0;
                    const pacotes = lote.pacotes || lote.qtdSacos || 0;
                    const pacotesPorCaixa = tipoFile === '800g' ? 12 : 24;
                    const totalPacotes = caixas * pacotesPorCaixa + pacotes;
                    return `${totalPacotes.toLocaleString()} pcts`;
                  })()}
                </p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-600 mb-0" style={{ fontSize: '9px' }}>Total Caixas</p>
                <p className="font-bold" style={{ fontSize: '12px', margin: 0 }}>
                  {(() => {
                    const tipoFile = lote.tipoFile || '400g';
                    const caixas = lote.caixas || lote.qtdMaster || 0;
                    const pacotes = lote.pacotes || lote.qtdSacos || 0;
                    const pacotesPorCaixa = tipoFile === '800g' ? 12 : 24;
                    const totalCaixas = pacotes / pacotesPorCaixa + caixas;
                    return `${totalCaixas.toFixed(2)} cxs`;
                  })()}
                </p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-600 mb-0" style={{ fontSize: '9px' }}>Filé Embalado</p>
                <p className="font-bold" style={{ fontSize: '12px', margin: 0 }}>{calcularTotal(lote.fileEmbalado).toFixed(2)} kg</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-600 mb-0" style={{ fontSize: '9px' }}>Data Fabric.</p>
                <p className="font-semibold" style={{ fontSize: '11px', margin: 0 }}>{lote.dataFabricacao ? new Date(lote.dataFabricacao).toLocaleDateString('pt-BR') : '-'}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-600 mb-0" style={{ fontSize: '9px' }}>Data Validade</p>
                <p className="font-semibold" style={{ fontSize: '11px', margin: 0 }}>{lote.dataValidade ? new Date(lote.dataValidade).toLocaleDateString('pt-BR') : '-'}</p>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <p className="text-gray-600 mb-0" style={{ fontSize: '9px' }}>Aprov. NF</p>
                <p className="font-bold text-green-900" style={{ fontSize: '12px', margin: 0 }}>{lote.aprovNotaFiscal || 0}%</p>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <p className="text-gray-600 mb-0" style={{ fontSize: '9px' }}>Aprov. Salão</p>
                <p className="font-bold text-green-900" style={{ fontSize: '12px', margin: 0 }}>{lote.aprovSalao || 0}%</p>
              </div>
              <div className="bg-blue-50 p-2 rounded">
                <p className="text-gray-600 mb-0" style={{ fontSize: '9px' }}>Custo Pacotes</p>
                <p className="font-bold text-blue-900" style={{ fontSize: '12px', margin: 0 }}>R$ {(lote.custoPacotes || custos.custoPacotes).toFixed(2)}</p>
              </div>
              <div className="bg-purple-50 p-2 rounded">
                <p className="text-gray-600 mb-0" style={{ fontSize: '9px' }}>Custo Caixas</p>
                <p className="font-bold text-purple-900" style={{ fontSize: '12px', margin: 0 }}>R$ {(lote.custoCaixas || custos.custoCaixas).toFixed(2)}</p>
              </div>
            </div>
            
            {tabelaCustos && (
              <div className="mt-3">
                <h3 style={{ fontSize: '12px', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }} className="font-bold text-gray-800 border-b border-gray-300 pb-1">
                  Análise de Custos
                </h3>
                <table className="w-full border-collapse border border-gray-300" style={{ fontSize: '11px' }}>
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 p-2 text-left" style={{ fontSize: '10px', textTransform: 'uppercase' }}>Unidade</th>
                      <th className="border border-gray-300 p-2 text-right bg-yellow-100" style={{ fontSize: '10px', textTransform: 'uppercase' }}>Filé (R$)</th>
                      <th className="border border-gray-300 p-2 text-right bg-blue-100" style={{ fontSize: '10px', textTransform: 'uppercase' }}>Embalagem (R$)</th>
                      <th className="border border-gray-300 p-2 text-right bg-green-100" style={{ fontSize: '10px', textTransform: 'uppercase' }}>Serviço (R$)</th>
                      <th className="border border-gray-300 p-2 text-right bg-purple-100" style={{ fontSize: '10px', textTransform: 'uppercase' }}>Total (R$)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-2 font-medium">Pacote</td>
                      <td className="border border-gray-300 p-2 text-right">R$ {tabelaCustos.custoFile.pacote.toFixed(2)}</td>
                      <td className="border border-gray-300 p-2 text-right">R$ {tabelaCustos.custoEmbalagem.pacote.toFixed(2)}</td>
                      <td className="border border-gray-300 p-2 text-right">R$ {tabelaCustos.custoServico.pacote.toFixed(2)}</td>
                      <td className="border border-gray-300 p-2 text-right font-bold">R$ {tabelaCustos.custoTotal.pacote.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-yellow-50">
                      <td className="border border-gray-300 p-2 font-medium">KG</td>
                      <td className="border border-gray-300 p-2 text-right">R$ {tabelaCustos.custoFile.kg.toFixed(2)}</td>
                      <td className="border border-gray-300 p-2 text-right">R$ {tabelaCustos.custoEmbalagem.kg.toFixed(2)}</td>
                      <td className="border border-gray-300 p-2 text-right">R$ {tabelaCustos.custoServico.kg.toFixed(2)}</td>
                      <td className="border border-gray-300 p-2 text-right font-bold">R$ {tabelaCustos.custoTotal.kg.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2 font-medium">Caixa</td>
                      <td className="border border-gray-300 p-2 text-right">R$ {tabelaCustos.custoFile.caixa.toFixed(2)}</td>
                      <td className="border border-gray-300 p-2 text-right">R$ {tabelaCustos.custoEmbalagem.caixa.toFixed(2)}</td>
                      <td className="border border-gray-300 p-2 text-right">R$ {tabelaCustos.custoServico.caixa.toFixed(2)}</td>
                      <td className="border border-gray-300 p-2 text-right font-bold">R$ {tabelaCustos.custoTotal.caixa.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-300 text-center" style={{ fontSize: '10px' }}>
          <p className="text-gray-600" style={{ margin: 0 }}>ValeFish - Sistema de Gestão de Lotes</p>
          <p className="text-gray-500" style={{ fontSize: '9px', margin: '2px 0 0 0' }}>
            Documento gerado automaticamente em {new Date().toLocaleString('pt-BR')}{username && ` por ${username}`}
          </p>
        </div>
      </div>
    );
  }
);

PrintableLote.displayName = 'PrintableLote';

export default PrintableLote;
