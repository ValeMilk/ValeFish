import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Package, Calendar, Hash, FileText, DollarSign, Scale, Fish } from "lucide-react";
import { LoteData } from "@/types/lote";
import { useState } from "react";

interface ViewLoteModalProps {
  lote: LoteData | null;
  open: boolean;
  onClose: () => void;
}

const ViewLoteModal = ({ lote, open, onClose }: ViewLoteModalProps) => {
  const [expandedSections, setExpandedSections] = useState({
    info: true,
    nf: true,
    peso: true,
    filetagem: true,
    embalagem: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!lote) return null;

  const InfoRow = ({ label, value }: { label: string; value: string | number | undefined }) => (
    <div className="flex justify-between py-2 border-b border-muted">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className="text-sm font-medium text-foreground">{value || '-'}</span>
    </div>
  );

  const WeightDisplay = ({ label, weights }: { label: string; weights: any }) => {
    if (!weights) return null;
    const total = (weights.P || 0) + (weights.M || 0) + (weights.G || 0) + (weights.GG || 0);
    
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-foreground">{label}</h4>
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-muted p-2 rounded text-center">
            <p className="text-xs text-muted-foreground">P</p>
            <p className="text-sm font-medium">{weights.P || 0} kg</p>
          </div>
          <div className="bg-muted p-2 rounded text-center">
            <p className="text-xs text-muted-foreground">M</p>
            <p className="text-sm font-medium">{weights.M || 0} kg</p>
          </div>
          <div className="bg-muted p-2 rounded text-center">
            <p className="text-xs text-muted-foreground">G</p>
            <p className="text-sm font-medium">{weights.G || 0} kg</p>
          </div>
          <div className="bg-muted p-2 rounded text-center">
            <p className="text-xs text-muted-foreground">GG</p>
            <p className="text-sm font-medium">{weights.GG || 0} kg</p>
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950 p-2 rounded text-center">
          <p className="text-sm font-bold text-blue-700 dark:text-blue-300">Total: {total.toFixed(2)} kg</p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Visualizar Lote #{lote.numeroLote}</DialogTitle>
          <DialogDescription>
            Detalhes completos do lote (somente leitura)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações Básicas */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('info')}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                <h3 className="font-semibold text-foreground">Informações Básicas</h3>
              </div>
              {expandedSections.info ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {expandedSections.info && (
              <div className="p-4 border-t space-y-2">
                <InfoRow label="Data Produção" value={lote.dataProducao} />
                <InfoRow label="Processo" value={lote.processo} />
                <InfoRow label="Fornecedor" value={lote.fornecedor} />
                <InfoRow label="Número do Lote" value={lote.numeroLote} />
                <InfoRow 
                  label="Status" 
                  value={
                    lote.status === 'finalizado' ? 'Finalizado' :
                    lote.status === 'em_producao' ? 'Em Produção' :
                    lote.status === 'aberto' ? 'Aberto' : 'Pendente'
                  } 
                />
              </div>
            )}
          </div>

          {/* Nota Fiscal */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('nf')}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <h3 className="font-semibold text-foreground">Nota Fiscal</h3>
              </div>
              {expandedSections.nf ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {expandedSections.nf && (
              <div className="p-4 border-t space-y-2">
                <InfoRow label="Número NF" value={lote.numeroNF} />
                <InfoRow label="Valor NF" value={lote.valorNF ? `R$ ${lote.valorNF.toFixed(2)}` : '-'} />
              </div>
            )}
          </div>

          {/* Pesos */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('peso')}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                <h3 className="font-semibold text-foreground">Pesos por Tamanho</h3>
              </div>
              {expandedSections.peso ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {expandedSections.peso && (
              <div className="p-4 border-t space-y-4">
                <WeightDisplay label="Peso Nota Fiscal" weights={lote.pesoNotaFiscal} />
                <WeightDisplay label="Peso Salão" weights={lote.pesoSalao} />
                <WeightDisplay label="Num. Basquetas" weights={lote.numBasquetas} />
              </div>
            )}
          </div>

          {/* Filetagem */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('filetagem')}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Fish className="w-5 h-5" />
                <h3 className="font-semibold text-foreground">Filetagem</h3>
              </div>
              {expandedSections.filetagem ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {expandedSections.filetagem && (
              <div className="p-4 border-t space-y-4">
                <WeightDisplay label="Filé In Natura" weights={lote.fileInNatura} />
                <WeightDisplay label="Filé Congelado" weights={lote.fileCongelado} />
                <WeightDisplay label="Filé Embalado" weights={lote.fileEmbalado} />
              </div>
            )}
          </div>

          {/* Embalagem */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('embalagem')}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                <h3 className="font-semibold text-foreground">Embalagem</h3>
              </div>
              {expandedSections.embalagem ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {expandedSections.embalagem && (
              <div className="p-4 border-t space-y-2">
                <InfoRow label="Qtd Master" value={lote.qtdMaster} />
                <InfoRow label="Qtd Sacos" value={lote.qtdSacos} />
                <InfoRow label="Data Fabricação" value={lote.dataFabricacao} />
                <InfoRow label="Data Validade" value={lote.dataValidade} />
              </div>
            )}
          </div>

          {/* Aproveitamento */}
          {(lote.aprovNotaFiscal || lote.aprovSalao) && (
            <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">Aproveitamento</h3>
              <div className="grid grid-cols-2 gap-4">
                {lote.aprovNotaFiscal && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Aprov. NF</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{lote.aprovNotaFiscal.toFixed(1)}%</p>
                  </div>
                )}
                {lote.aprovSalao && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Aprov. Salão</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{lote.aprovSalao.toFixed(1)}%</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botão Fechar */}
          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewLoteModal;
