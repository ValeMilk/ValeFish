import { useState } from "react";
import { Fish, Package, Calendar, Scale, Calculator, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormSection from "./FormSection";
import FormInput from "./FormInput";
import SizeWeightInput from "./SizeWeightInput";
import { LoteData, FishSize } from "@/types/lote";

interface FechamentoLoteProps {
  lote: LoteData;
  onChange: (field: keyof LoteData, value: any) => void;
  onSubmit: () => void;
}

const FechamentoLote = ({ lote, onChange, onSubmit }: FechamentoLoteProps) => {
  const [openSections, setOpenSections] = useState({
    filetagem: true,
    embalagem: true,
    resumo: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSizeChange = (field: keyof LoteData, size: FishSize, value: string) => {
    const current = lote[field] as any || { P: 0, M: 0, G: 0, GG: 0 };
    onChange(field, {
      ...current,
      [size]: value ? parseFloat(value) : 0
    });
  };

  // Cálculos automáticos de aproveitamento
  const calcularAproveitamento = (fileEmbalado: any, pesoReferencia: any) => {
    if (!fileEmbalado || !pesoReferencia) return '0.00';
    
    const totalFile = (fileEmbalado.P || 0) + (fileEmbalado.M || 0) + (fileEmbalado.G || 0) + (fileEmbalado.GG || 0);
    const totalPeso = (pesoReferencia.P || 0) + (pesoReferencia.M || 0) + (pesoReferencia.G || 0) + (pesoReferencia.GG || 0);
    
    if (totalPeso === 0) return '0.00';
    return ((totalFile / totalPeso) * 100).toFixed(2);
  };

  const aprovNotaFiscal = calcularAproveitamento(lote.fileEmbalado, lote.pesoNotaFiscal);
  const aprovSalao = calcularAproveitamento(lote.fileEmbalado, lote.pesoSalao);

  const calcularTotalFileEmbalado = () => {
    if (!lote.fileEmbalado) return 0;
    return (lote.fileEmbalado.P || 0) + (lote.fileEmbalado.M || 0) + (lote.fileEmbalado.G || 0) + (lote.fileEmbalado.GG || 0);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Info do Lote Selecionado */}
      <div className="card-ocean p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="icon-box">
            <Fish className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Lote {lote.numeroLote || '---'}</h3>
            <p className="text-sm text-muted-foreground">
              {lote.fornecedor || 'Sem fornecedor'} • Processo {lote.processo || '---'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Peso NF (Total)</p>
            <p className="font-semibold text-foreground">
              {lote.pesoNotaFiscal ? ((lote.pesoNotaFiscal.P || 0) + (lote.pesoNotaFiscal.M || 0) + (lote.pesoNotaFiscal.G || 0) + (lote.pesoNotaFiscal.GG || 0)).toFixed(2) : 0} kg
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Peso Salão (Total)</p>
            <p className="font-semibold text-foreground">
              {lote.pesoSalao ? ((lote.pesoSalao.P || 0) + (lote.pesoSalao.M || 0) + (lote.pesoSalao.G || 0) + (lote.pesoSalao.GG || 0)).toFixed(2) : 0} kg
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Basquetas (Total)</p>
            <p className="font-semibold text-foreground">
              {lote.numBasquetas ? ((lote.numBasquetas.P || 0) + (lote.numBasquetas.M || 0) + (lote.numBasquetas.G || 0) + (lote.numBasquetas.GG || 0)) : 0} und
            </p>
          </div>
        </div>
      </div>

      {/* Filetagem */}
      <FormSection
        title="Filetagem"
        icon={<Fish className="w-5 h-5 text-primary-foreground" />}
        isOpen={openSections.filetagem}
        onToggle={() => toggleSection('filetagem')}
        collapsible
      >
        <div className="space-y-4">
          <SizeWeightInput
            label="Filé In Natura"
            icon={<Scale className="w-4 h-4" />}
            values={lote.fileInNatura || { P: 0, M: 0, G: 0, GG: 0 }}
            onChange={(size, value) => handleSizeChange('fileInNatura', size, value)}
            suffix="KG"
          />
          <SizeWeightInput
            label="Filé Congelado"
            icon={<Scale className="w-4 h-4" />}
            values={lote.fileCongelado || { P: 0, M: 0, G: 0, GG: 0 }}
            onChange={(size, value) => handleSizeChange('fileCongelado', size, value)}
            suffix="KG"
          />
          <SizeWeightInput
            label="Filé Embalado"
            icon={<Scale className="w-4 h-4" />}
            values={lote.fileEmbalado || { P: 0, M: 0, G: 0, GG: 0 }}
            onChange={(size, value) => handleSizeChange('fileEmbalado', size, value)}
            suffix="KG"
          />
        </div>
      </FormSection>

      {/* Embalagem */}
      <FormSection
        title="Embalagem"
        icon={<Package className="w-5 h-5 text-primary-foreground" />}
        isOpen={openSections.embalagem}
        onToggle={() => toggleSection('embalagem')}
        collapsible
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Qtd Master"
            icon={<Package className="w-4 h-4" />}
            type="number"
            placeholder="0"
            value={lote.qtdMaster || ''}
            onChange={(v) => onChange('qtdMaster', parseInt(v) || 0)}
            suffix="cx"
          />
          <FormInput
            label="Sacos"
            icon={<Package className="w-4 h-4" />}
            type="number"
            placeholder="0"
            value={lote.qtdSacos || ''}
            onChange={(v) => onChange('qtdSacos', parseInt(v) || 0)}
            suffix="scs"
          />
          <FormInput
            label="Data Fabricação"
            icon={<Calendar className="w-4 h-4" />}
            type="date"
            value={lote.dataFabricacao || ''}
            onChange={(v) => onChange('dataFabricacao', v)}
          />
          <FormInput
            label="Data Validade"
            icon={<Calendar className="w-4 h-4" />}
            type="date"
            value={lote.dataValidade || ''}
            onChange={(v) => onChange('dataValidade', v)}
          />
        </div>
      </FormSection>

      {/* Resumo e Aproveitamento */}
      <FormSection
        title="Resumo do Lote"
        icon={<Calculator className="w-5 h-5 text-primary-foreground" />}
        isOpen={openSections.resumo}
        onToggle={() => toggleSection('resumo')}
        collapsible
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Aprov. Nota Fiscal</span>
            </div>
            <p className="text-3xl font-bold text-gradient-ocean">{aprovNotaFiscal}%</p>
            <p className="text-xs text-muted-foreground mt-1">Filé embalado / Peso NF</p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-accent/10 to-success/10 border border-accent/20">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">Aprov. Salão</span>
            </div>
            <p className="text-3xl font-bold text-gradient-ocean">{aprovSalao}%</p>
            <p className="text-xs text-muted-foreground mt-1">Filé embalado / Peso Salão</p>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Produto Acabado:</span>
            <span className="font-bold text-foreground">{calcularTotalFileEmbalado().toFixed(2)} kg</span>
          </div>
        </div>
      </FormSection>

      <Button variant="success" size="xl" className="w-full" onClick={onSubmit}>
        <CheckCircle className="w-5 h-5 mr-2" />
        Finalizar Lote
      </Button>
    </div>
  );
};

export default FechamentoLote;
