import { useState } from "react";
import { Package, Scale, TrendingUp, Clock, CheckCircle, AlertCircle, Edit } from "lucide-react";
import { LoteData } from "@/types/lote";
import { toast } from "@/hooks/use-toast";
import LoteModal from "./LoteModal";

interface DashboardProps {
  lotes: LoteData[];
  onLoteUpdate?: (lote: LoteData) => void;
}

const Dashboard = ({ lotes, onLoteUpdate }: DashboardProps) => {
  const [selectedLote, setSelectedLote] = useState<LoteData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Normalizar lotes: mapear _id para id
  const normalizedLotes = lotes.map(lote => ({
    ...lote,
    id: lote.id || (lote as any)._id || lote.id,
  }));
  const lotesAtivos = normalizedLotes.filter(l => l.status === 'em_producao').length;
  const lotesAbertos = normalizedLotes.filter(l => l.status === 'aberto').length;
  const lotesFinalizados = normalizedLotes.filter(l => l.status === 'finalizado').length;
  
  const calcularTotal = (field: any) => {
    return normalizedLotes.reduce((acc, l) => {
      const data = l[field as keyof LoteData] as any;
      if (!data) return acc;
      return acc + ((data.P || 0) + (data.M || 0) + (data.G || 0) + (data.GG || 0));
    }, 0);
  };

  const totalPesoSalao = calcularTotal('pesoSalao');
  const totalFileEmbalado = calcularTotal('fileEmbalado');

  const aproveitamentoMedio = totalPesoSalao > 0 
    ? ((totalFileEmbalado / totalPesoSalao) * 100).toFixed(1) 
    : '0.0';

  const handleEditLote = (lote: LoteData) => {
    setSelectedLote(lote);
    setModalOpen(true);
  };

  const handleSaveLote = async (updatedLote: LoteData, password: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const loteId = updatedLote.id || (updatedLote as any)._id;
      
      if (!loteId) {
        throw new Error('ID do lote não encontrado');
      }

      const response = await fetch(`http://localhost:4000/api/lotes/${loteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...updatedLote,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar lote');
      }

      toast({
        title: "Sucesso!",
        description: `Lote ${updatedLote.numeroLote} atualizado com sucesso.`,
      });

      if (onLoteUpdate) {
        onLoteUpdate(updatedLote);
      }

      setModalOpen(false);
      setSelectedLote(null);
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Erro ao salvar as alterações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Abertos</p>
              <p className="text-3xl font-bold text-foreground mt-1">{lotesAbertos}</p>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/15">
              <Package className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Finalizados</p>
              <p className="text-3xl font-bold text-foreground mt-1">{lotesFinalizados}</p>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-success/15">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Aproveitamento</p>
              <p className="text-3xl font-bold text-gradient-ocean mt-1">{aproveitamentoMedio}%</p>
            </div>
            <div className="icon-box">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Lotes Recentes */}
      <div className="card-ocean p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Lotes Recentes</h2>
          <span className="text-sm text-muted-foreground">{normalizedLotes.length} registros</span>
        </div>

        {normalizedLotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Nenhum lote registrado ainda</p>
            <p className="text-sm text-muted-foreground mt-1">Comece criando um registro de entrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {normalizedLotes.slice(0, 5).map((lote, index) => {
              const pesoNotaFiscalTotal = lote.pesoNotaFiscal 
                ? (lote.pesoNotaFiscal.P + lote.pesoNotaFiscal.M + lote.pesoNotaFiscal.G + lote.pesoNotaFiscal.GG)
                : 0;

              return (
                <div
                  key={lote.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Scale className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Lote {lote.numeroLote}</p>
                      <p className="text-sm text-muted-foreground">{lote.fornecedor} • Processo {lote.processo}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-foreground">{pesoNotaFiscalTotal.toFixed(2)} kg</p>
                      <p className="text-xs text-muted-foreground">Peso NF</p>
                    </div>
                    
                    <button
                      onClick={() => handleEditLote(lote)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                      title="Editar lote"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline">Editar</span>
                    </button>

                    <span className={`status-badge ${
                      lote.status === 'finalizado' ? 'status-complete' :
                      lote.status === 'em_producao' ? 'status-active' :
                      lote.status === 'aberto' ? 'status-open' :
                      'status-pending'
                    }`}>
                      {lote.status === 'finalizado' ? 'Finalizado' :
                       lote.status === 'em_producao' ? 'Em Produção' :
                       lote.status === 'aberto' ? 'Aberto' :
                       'Pendente'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      <LoteModal
        lote={selectedLote}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedLote(null);
        }}
        onSave={handleSaveLote}
        loading={loading}
      />
    </div>
  );
};

export default Dashboard;
