import { Calendar, Hash, User, Package, FileText, Scale, Fish, Calculator, CheckCircle, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FormSection from "./FormSection";
import FormInput from "./FormInput";
import SizeWeightInput from "./SizeWeightInput";
import { LoteData, FishSize } from "@/types/lote";
import { useState, useEffect } from "react";

interface RegistroEntradaProps {
  lote: LoteData;
  onChange: (field: keyof LoteData, value: any) => void;
  onSubmit: (status: 'aberto' | 'finalizado') => void;
  loading?: boolean;
  loadingAberto?: boolean;
  isEditing?: boolean;
  onCancel?: () => void;
}

const FORNECEDORES = ["VALEFISH", "NORFISH", "CARLITO"];

const RegistroEntrada = ({ lote, onChange, onSubmit, loading = false, loadingAberto = false, isEditing = false, onCancel }: RegistroEntradaProps) => {
  const [notaFiscalConfirmado, setNotaFiscalConfirmado] = useState(false);
  const [filetagemConfirmado, setFiletagemConfirmado] = useState(false);
  const [embalagemConfirmado, setEmbalagemConfirmado] = useState(false);
  const [tipoFile, setTipoFile] = useState<'400g' | '800g'>(lote.tipoFile || '400g');

  // Sincronizar tipoFile quando o lote mudar
  useEffect(() => {
    if (lote.tipoFile) {
      setTipoFile(lote.tipoFile);
    }
  }, [lote.tipoFile]);

  // Calcular data de validade automaticamente quando data de fabricação mudar
  useEffect(() => {
    if (lote.dataFabricacao && !embalagemConfirmado) {
      const dataFab = new Date(lote.dataFabricacao + 'T00:00:00');
      dataFab.setDate(dataFab.getDate() + 364);
      const dataValidade = dataFab.toISOString().split('T')[0];
      onChange('dataValidade', dataValidade);
    }
  }, [lote.dataFabricacao, embalagemConfirmado]);

  const handleSizeChange = (field: keyof LoteData, size: FishSize, value: string) => {
    const current = lote[field] as any || { P: 0, M: 0, G: 0, GG: 0 };
    onChange(field, {
      ...current,
      [size]: value ? parseFloat(value) : 0
    });
  };

  // Calcular totais de peso
  const calcularTotalPeso = (peso: any) => {
    if (!peso) return 0;
    return (peso.P || 0) + (peso.M || 0) + (peso.G || 0) + (peso.GG || 0);
  };

  const totalPesoNotaFiscal = calcularTotalPeso(lote.pesoNotaFiscal);
  const totalPesoSalao = calcularTotalPeso(lote.pesoSalao);
  const gap = totalPesoSalao - totalPesoNotaFiscal;

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

  const calcularTotalFiletagemProduzida = () => {
    const inNatura = calcularTotalPeso(lote.fileInNatura);
    const congelado = calcularTotalPeso(lote.fileCongelado);
    return inNatura + congelado;
  };

  const calcularDiferencaFiletagem = () => {
    const inNatura = calcularTotalPeso(lote.fileInNatura);
    const congelado = calcularTotalPeso(lote.fileCongelado);
    return congelado - inNatura;
  };

  const calcularRendimentoFiletagem = () => {
    const inNatura = calcularTotalPeso(lote.fileInNatura);
    const congelado = calcularTotalPeso(lote.fileCongelado);
    if (inNatura === 0) return 0;
    return ((congelado / inNatura) * 100);
  };

  // Cálculos de Embalagem
  const gramatura = tipoFile === '400g' ? 400 : 800; // em gramas

  const calcularKgMaster = () => {
    if (!lote.qtdMaster) return 0;
    // Fórmula: qtdMaster * (gramatura * 24)
    return (lote.qtdMaster * (gramatura * 24)) / 1000; // dividido por 1000 para converter de gramas para kg
  };

  const calcularKgSacos = () => {
    if (!lote.qtdSacos) return 0;
    // Fórmula: qtdSacos * gramatura
    return (lote.qtdSacos * gramatura) / 1000; // dividido por 1000 para converter de gramas para kg
  };

  const calcularFileEmbalado = () => {
    return calcularKgMaster() + calcularKgSacos();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {isEditing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-blue-800 font-medium">
            📝 Editando Lote {lote.numeroLote}
          </p>
          <p className="text-blue-600 text-sm mt-1">
            Você pode atualizar os dados e finalizar este lote aberto.
          </p>
        </div>
      )}
      
      <FormSection
        title="Informações do Lote"
        icon={<Package className="w-5 h-5 text-primary-foreground" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Data"
            icon={<Calendar className="w-4 h-4" />}
            type="date"
            value={lote.dataProducao}
            onChange={(v) => onChange('dataProducao', v)}
          />
          <FormInput
            label="Processo"
            icon={<Hash className="w-4 h-4" />}
            placeholder="Digite o processo"
            value={lote.processo}
            onChange={(v) => onChange('processo', v)}
          />
          
          {/* Select de Fornecedor */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Nome do Fornecedor</label>
            <Select value={lote.fornecedor} onValueChange={(v) => onChange('fornecedor', v)}>
              <SelectTrigger className="input-ocean">
                <SelectValue placeholder="Selecione um fornecedor" />
              </SelectTrigger>
              <SelectContent>
                {FORNECEDORES.map((fornecedor) => (
                  <SelectItem key={fornecedor} value={fornecedor}>
                    {fornecedor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <FormInput
            label="Número do Lote"
            icon={<Package className="w-4 h-4" />}
            placeholder="Digite o número do lote"
            value={lote.numeroLote}
            onChange={(v) => onChange('numeroLote', v)}
          />
        </div>
      </FormSection>

      <FormSection
        title="Nota Fiscal e Peso"
        icon={<FileText className="w-5 h-5 text-primary-foreground" />}
        collapsed={notaFiscalConfirmado}
        headerContent={notaFiscalConfirmado ? (
          <div className="flex gap-1 md:gap-2 ml-auto items-center flex-wrap md:flex-nowrap justify-end">
            <div className="px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-blue-100 border border-blue-300 text-center">
              <p className="text-xs font-medium text-blue-700">Total NF</p>
              <p className="text-xs md:text-sm font-bold text-blue-900">{totalPesoNotaFiscal.toFixed(2)} kg</p>
            </div>
            <div className="px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-green-100 border border-green-300 text-center">
              <p className="text-xs font-medium text-green-700">Total Salão</p>
              <p className="text-xs md:text-sm font-bold text-green-900">{totalPesoSalao.toFixed(2)} kg</p>
            </div>
            <div className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg border text-center ${
              gap >= 0 
                ? 'bg-orange-100 border-orange-300' 
                : 'bg-red-100 border-red-300'
            }`}>
              <p className={`text-xs font-medium ${gap >= 0 ? 'text-orange-700' : 'text-red-700'}`}>Gap</p>
              <p className={`text-xs md:text-sm font-bold ${gap >= 0 ? 'text-orange-900' : 'text-red-900'}`}>{gap.toFixed(2)} kg</p>
            </div>
            <button
              onClick={() => setNotaFiscalConfirmado(false)}
              className="p-1 md:p-2 hover:bg-foreground/10 rounded-lg transition-colors ml-1"
              title="Editar"
            >
              <Edit2 className="w-4 h-4 text-foreground" />
            </button>
          </div>
        ) : undefined}
      >
        <div className="space-y-4">
          <FormInput
            label="Nº Nota Fiscal"
            icon={<FileText className="w-4 h-4" />}
            placeholder="Digite o número da NF"
            value={lote.numeroNF || ''}
            onChange={(v) => onChange('numeroNF', v)}
            disabled={notaFiscalConfirmado}
            inputMode="numeric"
          />
          <FormInput
            label="Valor da Nota Fiscal"
            icon={<FileText className="w-4 h-4" />}
            type="number"
            placeholder="Digite o valor"
            value={lote.valorNF || ''}
            onChange={(v) => onChange('valorNF', v ? parseFloat(v) : undefined)}
            suffix="R$"
            disabled={notaFiscalConfirmado}
            inputMode="decimal"
          />
          <SizeWeightInput
            label="Peso Nota Fiscal"
            icon={<Scale className="w-4 h-4" />}
            values={lote.pesoNotaFiscal || { P: 0, M: 0, G: 0, GG: 0 }}
            onChange={(size, value) => handleSizeChange('pesoNotaFiscal', size, value)}
            suffix="KG"
            disabled={notaFiscalConfirmado}
          />
          <SizeWeightInput
            label="Peso do Salão"
            icon={<Scale className="w-4 h-4" />}
            values={lote.pesoSalao || { P: 0, M: 0, G: 0, GG: 0 }}
            onChange={(size, value) => handleSizeChange('pesoSalao', size, value)}
            suffix="KG"
            disabled={notaFiscalConfirmado}
          />
          <SizeWeightInput
            label="Nº Basquetas/Caixas"
            icon={<Package className="w-4 h-4" />}
            values={lote.numBasquetas || { P: 0, M: 0, G: 0, GG: 0 }}
            onChange={(size, value) => handleSizeChange('numBasquetas', size, value)}
            suffix="und"
            disabled={notaFiscalConfirmado}
          />
          
          {!notaFiscalConfirmado && (
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full border-2"
              onClick={() => setNotaFiscalConfirmado(true)}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Confirmar Nota Fiscal e Peso
            </Button>
          )}
        </div>
      </FormSection>

      {/* Filetagem */}
      <FormSection
        title="Filetagem"
        icon={<Fish className="w-5 h-5 text-primary-foreground" />}
        collapsed={filetagemConfirmado}
        headerContent={filetagemConfirmado ? (
          <div className="flex gap-1 md:gap-2 ml-auto items-center flex-wrap md:flex-nowrap justify-end">
            <div className="px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-blue-100 border border-blue-300 text-center">
              <p className="text-xs font-medium text-blue-700">In Natura</p>
              <p className="text-xs md:text-sm font-bold text-blue-900">{calcularTotalPeso(lote.fileInNatura).toFixed(2)} kg</p>
            </div>
            <div className="px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-cyan-100 border border-cyan-300 text-center">
              <p className="text-xs font-medium text-cyan-700">Congelado</p>
              <p className="text-xs md:text-sm font-bold text-cyan-900">{calcularTotalPeso(lote.fileCongelado).toFixed(2)} kg</p>
            </div>
            <div className="px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-green-100 border border-green-300 text-center">
              <p className="text-xs font-medium text-green-700">Diferença</p>
              <p className="text-xs md:text-sm font-bold text-green-900">{calcularDiferencaFiletagem().toFixed(2)} kg</p>
            </div>
            <div className="px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-purple-100 border border-purple-300 text-center">
              <p className="text-xs font-medium text-purple-700">Rendimento</p>
              <p className="text-xs md:text-sm font-bold text-purple-900">{calcularRendimentoFiletagem().toFixed(1)}%</p>
            </div>
            <button
              onClick={() => setFiletagemConfirmado(false)}
              className="p-1 md:p-2 hover:bg-foreground/10 rounded-lg transition-colors ml-1"
              title="Editar"
            >
              <Edit2 className="w-4 h-4 text-foreground" />
            </button>
          </div>
        ) : undefined}
      >
        <div className="space-y-4">
          <SizeWeightInput
            label="Filé In Natura"
            icon={<Scale className="w-4 h-4" />}
            values={lote.fileInNatura || { P: 0, M: 0, G: 0, GG: 0 }}
            onChange={(size, value) => handleSizeChange('fileInNatura', size, value)}
            suffix="KG"
            disabled={filetagemConfirmado}
          />
          <SizeWeightInput
            label="Filé Congelado"
            icon={<Scale className="w-4 h-4" />}
            values={lote.fileCongelado || { P: 0, M: 0, G: 0, GG: 0 }}
            onChange={(size, value) => handleSizeChange('fileCongelado', size, value)}
            suffix="KG"
            disabled={filetagemConfirmado}
          />
          
          {!filetagemConfirmado && (
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full border-2"
              onClick={() => setFiletagemConfirmado(true)}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Confirmar Filetagem
            </Button>
          )}
        </div>
      </FormSection>

      {/* Seleção de Tipo de Filé */}
      <FormSection
        title="Tipo de Filé"
        icon={<Fish className="w-5 h-5 text-primary-foreground" />}
      >
        <div className="flex gap-3">
          <button
            onClick={() => {
              setTipoFile('400g');
              onChange('tipoFile', '400g');
            }}
            className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
              tipoFile === '400g'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted border-muted-foreground/30 text-foreground hover:border-primary/50'
            }`}
          >
            Filé 400g
          </button>
          <button
            onClick={() => {
              setTipoFile('800g');
              onChange('tipoFile', '800g');
            }}
            className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
              tipoFile === '800g'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted border-muted-foreground/30 text-foreground hover:border-primary/50'
            }`}
          >
            Filé 800g
          </button>
        </div>
      </FormSection>

      {/* Embalagem */}
      <FormSection
        title="Embalagem"
        icon={<Package className="w-5 h-5 text-primary-foreground" />}
        collapsed={embalagemConfirmado}
        headerContent={embalagemConfirmado ? (
          <div className="flex gap-1 md:gap-2 ml-auto items-center flex-wrap md:flex-nowrap justify-end">
            <div className="px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-indigo-100 border border-indigo-300 text-center">
              <p className="text-xs font-medium text-indigo-700">Master</p>
              <p className="text-xs md:text-sm font-bold text-indigo-900">{calcularKgMaster().toFixed(2)} kg</p>
            </div>
            <div className="px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-violet-100 border border-violet-300 text-center">
              <p className="text-xs font-medium text-violet-700">Sacos</p>
              <p className="text-xs md:text-sm font-bold text-violet-900">{calcularKgSacos().toFixed(2)} kg</p>
            </div>
            <button
              onClick={() => setEmbalagemConfirmado(false)}
              className="p-1 md:p-2 hover:bg-foreground/10 rounded-lg transition-colors ml-1"
              title="Editar"
            >
              <Edit2 className="w-4 h-4 text-foreground" />
            </button>
          </div>
        ) : undefined}
      >
        <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-muted-foreground/20">
          <p className="text-sm font-medium text-foreground">
            Tipo de Filé selecionado: <span className="font-bold text-primary">{tipoFile}</span>
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Caixas</label>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={lote.qtdMaster || ''}
                  onChange={(v) => {
                    const valor = parseInt(v.target.value) || 0;
                    onChange('qtdMaster', valor);
                    onChange('caixas', valor);
                  }}
                  disabled={embalagemConfirmado}
                  className="w-full px-3 py-2 rounded-lg border border-muted-foreground/30 bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="px-2 py-1.5 bg-primary/10 rounded-lg border border-primary/20 text-center min-w-fit">
                <p className="text-xs text-muted-foreground">= Total</p>
                <p className="text-sm font-bold text-primary">{calcularKgMaster().toFixed(2)} kg</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Pacotes ({tipoFile})</label>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={lote.qtdSacos || ''}
                  onChange={(v) => {
                    const valor = parseInt(v.target.value) || 0;
                    onChange('qtdSacos', valor);
                    onChange('pacotes', valor);
                  }}
                  disabled={embalagemConfirmado}
                  className="w-full px-3 py-2 rounded-lg border border-muted-foreground/30 bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="px-2 py-1.5 bg-primary/10 rounded-lg border border-primary/20 text-center min-w-fit">
                <p className="text-xs text-muted-foreground">= Total</p>
                <p className="text-sm font-bold text-primary">{calcularKgSacos().toFixed(2)} kg</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20 md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Filé Embalado Total:</span>
              <span className="text-lg font-bold text-primary">{calcularFileEmbalado().toFixed(2)} kg</span>
            </div>
          </div>

          <FormInput
            label="Data Fabricação"
            icon={<Calendar className="w-4 h-4" />}
            type="date"
            value={lote.dataFabricacao || ''}
            onChange={(v) => onChange('dataFabricacao', v)}
            disabled={embalagemConfirmado}
          />
          <FormInput
            label="Data Validade"
            icon={<Calendar className="w-4 h-4" />}
            type="date"
            value={lote.dataValidade || ''}
            onChange={(v) => onChange('dataValidade', v)}
            disabled={embalagemConfirmado}
          />
        </div>

        {!embalagemConfirmado && (
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full border-2 mt-4"
            onClick={() => {
              // Auto-preencher fileEmbalado com o total calculado
              const totalFileEmbalado = calcularFileEmbalado();
              onChange('fileEmbalado', {
                P: totalFileEmbalado,
                M: 0,
                G: 0,
                GG: 0
              });
              // Salvar tipo de filé, caixas e pacotes
              onChange('tipoFile', tipoFile);
              onChange('caixas', lote.qtdMaster || 0);
              onChange('pacotes', lote.qtdSacos || 0);
              // Salvar aproveitamentos calculados (converter string para número)
              onChange('aprovNotaFiscal', parseFloat(aprovNotaFiscal));
              onChange('aprovSalao', parseFloat(aprovSalao));
              setEmbalagemConfirmado(true);
            }}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Confirmar Embalagem
          </Button>
        )}
      </FormSection>

      {/* Resumo e Aproveitamento */}
      <FormSection
        title="Resumo do Lote"
        icon={<Calculator className="w-5 h-5 text-primary-foreground" />}
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

      <div className={`grid grid-cols-1 ${isEditing ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4`}>
        {isEditing && onCancel && (
          <Button 
            variant="outline" 
            size="xl" 
            className="w-full" 
            onClick={onCancel}
            disabled={loading || loadingAberto}
          >
            Cancelar
          </Button>
        )}
        
        <Button 
          variant="outline" 
          size="xl" 
          className="w-full border-blue-500 text-blue-600 hover:bg-blue-50" 
          onClick={() => onSubmit('aberto')}
          disabled={loading || loadingAberto}
        >
          <Package className="w-5 h-5 mr-2" />
          {loadingAberto ? 'Salvando...' : isEditing ? 'Salvar Aberto' : 'Salvar Aberto'}
        </Button>
        
        <Button 
          variant="success" 
          size="xl" 
          className="w-full" 
          onClick={() => onSubmit('finalizado')}
          disabled={loading || loadingAberto}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          {loading ? 'Salvando...' : isEditing ? 'Finalizar' : 'Finalizar'}
        </Button>
      </div>
    </div>
  );
};

export default RegistroEntrada;
