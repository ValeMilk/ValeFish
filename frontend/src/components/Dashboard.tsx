import { Package, Scale, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { LoteData } from "@/types/lote";

interface DashboardProps {
  lotes: LoteData[];
}

const Dashboard = ({ lotes }: DashboardProps) => {
  const lotesAtivos = lotes.filter(l => l.status === 'em_producao').length;
  const lotesPendentes = lotes.filter(l => l.status === 'pendente').length;
  const lotesFinalizados = lotes.filter(l => l.status === 'finalizado').length;
  
  const calcularTotal = (field: any) => {
    return lotes.reduce((acc, l) => {
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Lotes Ativos</p>
              <p className="text-3xl font-bold text-foreground mt-1">{lotesAtivos}</p>
            </div>
            <div className="icon-box">
              <Clock className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-3xl font-bold text-foreground mt-1">{lotesPendentes}</p>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-warning/15">
              <AlertCircle className="w-5 h-5 text-warning" />
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
          <span className="text-sm text-muted-foreground">{lotes.length} registros</span>
        </div>

        {lotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Nenhum lote registrado ainda</p>
            <p className="text-sm text-muted-foreground mt-1">Comece criando um registro de entrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lotes.slice(0, 5).map((lote, index) => {
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
                    
                    <span className={`status-badge ${
                      lote.status === 'finalizado' ? 'status-complete' :
                      lote.status === 'em_producao' ? 'status-active' :
                      'status-pending'
                    }`}>
                      {lote.status === 'finalizado' ? 'Finalizado' :
                       lote.status === 'em_producao' ? 'Em Produção' :
                       'Pendente'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
