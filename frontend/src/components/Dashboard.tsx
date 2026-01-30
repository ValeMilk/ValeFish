import { useState, useMemo, useRef } from "react";
import { Package, Scale, TrendingUp, Clock, CheckCircle, AlertCircle, Edit, Eye, DollarSign, Printer } from "lucide-react";
import { LoteData } from "@/types/lote";
import { toast } from "@/hooks/use-toast";
import LoteModal from "./LoteModal";
import ViewLoteModal from "./ViewLoteModal";
import PrintableLote from "./PrintableLote";
import { useReactToPrint } from 'react-to-print';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  lotes: LoteData[];
  onLoteUpdate?: (lote: LoteData) => void;
  onLoadLoteForEdit?: (lote: LoteData) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const Dashboard = ({ lotes, onLoteUpdate, onLoadLoteForEdit }: DashboardProps) => {
  const [selectedLote, setSelectedLote] = useState<LoteData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loteToPrint, setLoteToPrint] = useState<LoteData | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Lote-${loteToPrint?.numeroLote || 'documento'}`,
  });

  const handlePrintLote = (lote: LoteData) => {
    setLoteToPrint(lote);
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  // Normalizar lotes: mapear _id para id
  let normalizedLotes = lotes.map(lote => ({
    ...lote,
    id: lote.id || (lote as any)._id || lote.id,
  }));

  // Filtrar por período
  if (startDate) {
    normalizedLotes = normalizedLotes.filter(l => l.dataProducao >= startDate);
  }
  if (endDate) {
    normalizedLotes = normalizedLotes.filter(l => l.dataProducao <= endDate);
  }
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

  // Calcular faturamento dos lotes finalizados
  const faturamentoFinalizados = normalizedLotes
    .filter(l => l.status === 'finalizado')
    .reduce((acc, l) => acc + (l.valorNF || 0), 0);

  // Preparar dados para gráficos (por data)
  const chartData = useMemo(() => {
    const dataMap = new Map<string, { date: string; kg: number; valor: number; count: number }>();
    
    normalizedLotes.forEach(lote => {
      const date = lote.dataProducao;
      if (!dataMap.has(date)) {
        dataMap.set(date, { date, kg: 0, valor: 0, count: 0 });
      }
      const entry = dataMap.get(date)!;
      
      // Somar kg (peso nota fiscal)
      if (lote.pesoNotaFiscal) {
        const totalKg = lote.pesoNotaFiscal.P + lote.pesoNotaFiscal.M + lote.pesoNotaFiscal.G + lote.pesoNotaFiscal.GG;
        entry.kg += totalKg;
      }
      
      // Somar valor apenas dos lotes finalizados
      if (lote.status === 'finalizado' && lote.valorNF) {
        entry.valor += lote.valorNF;
      }
      
      entry.count += 1;
    });
    
    return Array.from(dataMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7); // Últimos 7 dias
  }, [normalizedLotes]);

  const handleViewLote = (lote: LoteData) => {
    setSelectedLote(lote);
    setViewModalOpen(true);
  };

  const handleEditLote = (lote: LoteData) => {
    // Se o lote está aberto, carrega na tela de entrada para finalizar
    if (lote.status === 'aberto' && onLoadLoteForEdit) {
      onLoadLoteForEdit(lote);
    } else {
      // Caso contrário, abre o modal de edição
      setSelectedLote(lote);
      setModalOpen(true);
    }
  };

  const handleSaveLote = async (updatedLote: LoteData, password: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const loteId = updatedLote.id || (updatedLote as any)._id;
      
      if (!loteId) {
        throw new Error('ID do lote não encontrado');
      }

      const response = await fetch(`${API_URL}/lotes/${loteId}`, {
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
      {/* Filtros de Período */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Filtrar por Período</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Data Inicial</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Data Final</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="w-full px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <p className="text-sm text-muted-foreground">Faturamento</p>
              <p className="text-3xl font-bold text-foreground mt-1">R$ {faturamentoFinalizados.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-xs text-muted-foreground mt-1">Lotes finalizados</p>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-yellow-500/15">
              <TrendingUp className="w-5 h-5 text-yellow-500" />
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

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico Kg Processados */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Kg Processados (Últimos 7 dias)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                formatter={(value: any) => [`${value.toFixed(2)} kg`, 'Kg']}
              />
              <Legend />
              <Line type="monotone" dataKey="kg" stroke="#3b82f6" strokeWidth={2} name="Kg" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico Faturamento */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Faturamento Lotes Finalizados (Últimos 7 dias)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                formatter={(value: any) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Faturamento']}
              />
              <Legend />
              <Line type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={2} name="Faturamento (R$)" />
            </LineChart>
          </ResponsiveContainer>
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
                      onClick={() => handleViewLote(lote)}
                      className="p-2 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                      title="Ver detalhes do lote"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Ver</span>
                    </button>
                    
                    <button
                      onClick={() => handleEditLote(lote)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                      title="Editar lote"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline">Editar</span>
                    </button>

                    <button
                      onClick={() => handlePrintLote(lote)}
                      className="p-2 hover:bg-purple-100 rounded-lg transition-colors flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
                      title="Imprimir lote"
                    >
                      <Printer className="w-4 h-4" />
                      <span className="hidden sm:inline">Imprimir</span>
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

      {/* Modal de Visualização */}
      <ViewLoteModal
        lote={selectedLote}
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedLote(null);
        }}
      />

      {/* Componente oculto para impressão */}
      <div style={{ display: 'none' }}>
        {loteToPrint && <PrintableLote ref={printRef} lote={loteToPrint} />}
      </div>
    </div>
  );
};

export default Dashboard;
