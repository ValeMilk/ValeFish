import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormInput from "./FormInput";
import { Lock, ChevronUp, ChevronDown } from "lucide-react";
import { LoteData } from "@/types/lote";

interface LoteModalProps {
  lote: LoteData | null;
  open: boolean;
  onClose: () => void;
  onSave: (lote: LoteData, password: string) => void;
  loading?: boolean;
}

const LoteModal = ({ lote, open, onClose, onSave, loading = false }: LoteModalProps) => {
  const [editedLote, setEditedLote] = useState<LoteData | null>(lote);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    info: true,
    nf: true,
    peso: true,
    filetagem: true,
    embalagem: true,
  });

  useEffect(() => {
    setEditedLote(lote);
  }, [lote]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleChange = (field: keyof LoteData, value: any) => {
    if (editedLote) {
      setEditedLote({
        ...editedLote,
        [field]: value
      });
    }
  };

  const handleWeightChange = (field: string, size: string, value: number) => {
    if (editedLote) {
      setEditedLote({
        ...editedLote,
        [field]: {
          ...(editedLote[field as keyof LoteData] as any),
          [size]: value
        }
      });
    }
  };

  const handleSave = () => {
    if (!editedLote) return;
    
    if (!password) {
      alert("Digite sua senha para confirmar a edição");
      return;
    }

    onSave(editedLote, password);
    setPassword("");
  };

  if (!editedLote) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Lote #{editedLote.numeroLote}</DialogTitle>
          <DialogDescription>
            Modifique os dados do lote e confirme com sua senha
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações Básicas */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('info')}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold text-foreground">Informações Básicas</h3>
              {expandedSections.info ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {expandedSections.info && (
              <div className="p-4 border-t space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Data Produção"
                    type="date"
                    value={editedLote.dataProducao || ''}
                    onChange={(v) => handleChange('dataProducao', v)}
                  />
                  <FormInput
                    label="Processo"
                    value={editedLote.processo || ''}
                    onChange={(v) => handleChange('processo', v)}
                  />
                  <FormInput
                    label="Fornecedor"
                    value={editedLote.fornecedor || ''}
                    onChange={(v) => handleChange('fornecedor', v)}
                  />
                  <FormInput
                    label="Número do Lote"
                    value={editedLote.numeroLote || ''}
                    onChange={(v) => handleChange('numeroLote', v)}
                  />
                  <FormInput
                    label="Status"
                    value={editedLote.status || 'pendente'}
                    onChange={(v) => handleChange('status', v as any)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Nota Fiscal */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('nf')}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold text-foreground">Nota Fiscal</h3>
              {expandedSections.nf ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {expandedSections.nf && (
              <div className="p-4 border-t space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Nº Nota Fiscal"
                    value={editedLote.numeroNF || ''}
                    onChange={(v) => handleChange('numeroNF', v)}
                  />
                  <FormInput
                    label="Valor NF"
                    type="number"
                    value={editedLote.valorNF || ''}
                    onChange={(v) => handleChange('valorNF', v ? parseFloat(v) : undefined)}
                    suffix="R$"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Pesos */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('peso')}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold text-foreground">Pesos por Tamanho</h3>
              {expandedSections.peso ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {expandedSections.peso && (
              <div className="p-4 border-t space-y-6">
                {/* Peso Nota Fiscal */}
                <div>
                  <h4 className="text-sm font-medium mb-3 text-foreground">Peso Nota Fiscal (kg)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(['P', 'M', 'G', 'GG'] as const).map(size => (
                      <FormInput
                        key={`pesoNF-${size}`}
                        label={`Tamanho ${size}`}
                        type="number"
                        value={(editedLote.pesoNotaFiscal?.[size] || 0).toString()}
                        onChange={(v) => handleWeightChange('pesoNotaFiscal', size, parseFloat(v) || 0)}
                      />
                    ))}
                  </div>
                </div>

                {/* Peso Salão */}
                <div>
                  <h4 className="text-sm font-medium mb-3 text-foreground">Peso Salão (kg)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(['P', 'M', 'G', 'GG'] as const).map(size => (
                      <FormInput
                        key={`pesoSalao-${size}`}
                        label={`Tamanho ${size}`}
                        type="number"
                        value={(editedLote.pesoSalao?.[size] || 0).toString()}
                        onChange={(v) => handleWeightChange('pesoSalao', size, parseFloat(v) || 0)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filetagem */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('filetagem')}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold text-foreground">Filetagem (kg)</h3>
              {expandedSections.filetagem ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {expandedSections.filetagem && (
              <div className="p-4 border-t space-y-6">
                {/* Filé In Natura */}
                <div>
                  <h4 className="text-sm font-medium mb-3 text-foreground">Filé In Natura</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(['P', 'M', 'G', 'GG'] as const).map(size => (
                      <FormInput
                        key={`fileInNatura-${size}`}
                        label={`Tamanho ${size}`}
                        type="number"
                        value={(editedLote.fileInNatura?.[size] || 0).toString()}
                        onChange={(v) => handleWeightChange('fileInNatura', size, parseFloat(v) || 0)}
                      />
                    ))}
                  </div>
                </div>

                {/* Filé Congelado */}
                <div>
                  <h4 className="text-sm font-medium mb-3 text-foreground">Filé Congelado</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(['P', 'M', 'G', 'GG'] as const).map(size => (
                      <FormInput
                        key={`fileCongelado-${size}`}
                        label={`Tamanho ${size}`}
                        type="number"
                        value={(editedLote.fileCongelado?.[size] || 0).toString()}
                        onChange={(v) => handleWeightChange('fileCongelado', size, parseFloat(v) || 0)}
                      />
                    ))}
                  </div>
                </div>

                {/* Filé Embalado */}
                <div>
                  <h4 className="text-sm font-medium mb-3 text-foreground">Filé Embalado</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(['P', 'M', 'G', 'GG'] as const).map(size => (
                      <FormInput
                        key={`fileEmbalado-${size}`}
                        label={`Tamanho ${size}`}
                        type="number"
                        value={(editedLote.fileEmbalado?.[size] || 0).toString()}
                        onChange={(v) => handleWeightChange('fileEmbalado', size, parseFloat(v) || 0)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Embalagem */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('embalagem')}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold text-foreground">Embalagem</h3>
              {expandedSections.embalagem ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {expandedSections.embalagem && (
              <div className="p-4 border-t space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Quantidade Master"
                    type="number"
                    value={editedLote.qtdMaster || ''}
                    onChange={(v) => handleChange('qtdMaster', v ? parseFloat(v) : undefined)}
                  />
                  <FormInput
                    label="Quantidade Sacos"
                    type="number"
                    value={editedLote.qtdSacos || ''}
                    onChange={(v) => handleChange('qtdSacos', v ? parseFloat(v) : undefined)}
                  />
                  <FormInput
                    label="Data Fabricação"
                    type="date"
                    value={editedLote.dataFabricacao || ''}
                    onChange={(v) => handleChange('dataFabricacao', v)}
                  />
                  <FormInput
                    label="Data Validade"
                    type="date"
                    value={editedLote.dataValidade || ''}
                    onChange={(v) => handleChange('dataValidade', v)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirmação de Senha */}
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mt-6">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-warning" />
              <label className="text-sm font-medium text-foreground">
                Digite sua senha para confirmar a edição
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-muted-foreground/30 bg-muted"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={loading || !password}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoteModal;
