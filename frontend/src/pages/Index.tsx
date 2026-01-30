import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import RegistroEntrada from "@/components/RegistroEntrada";
import { LoteData, createEmptyLote } from "@/types/lote";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

interface IndexProps {
  onLogout?: () => void;
}

const Index = ({ onLogout }: IndexProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'entrada'>('dashboard');
  const [lotes, setLotes] = useState<LoteData[]>([]);
  const [currentLote, setCurrentLote] = useState<LoteData>(createEmptyLote());
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingSubmitAberto, setLoadingSubmitAberto] = useState(false);
  const [isEditingLote, setIsEditingLote] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [pendingStatus, setPendingStatus] = useState<'aberto' | 'finalizado' | null>(null);

  // Carregar lotes do backend ao montar o componente
  useEffect(() => {
    const fetchLotes = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${API_URL}/lotes`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          throw new Error('Erro ao carregar lotes');
        }

        const data = await response.json();
        // Normalizar lotes: mapear _id para id
        const normalizedLotes = data.map((lote: any) => ({
          ...lote,
          id: lote.id || lote._id,
        }));
        setLotes(normalizedLotes);
      } catch (error) {
        console.error('Erro ao carregar lotes:', error);
        // Não mostrar erro, apenas log
      }
    };

    fetchLotes();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  const handleLoteChange = (field: keyof LoteData, value: any) => {
    setCurrentLote(prev => ({ ...prev, [field]: value }));
  };

  const handleLoadLoteForEdit = (lote: LoteData) => {
    setCurrentLote(lote);
    setIsEditingLote(true);
    setActiveTab('entrada');
  };

  const handleRegistrarEntrada = async (status: 'aberto' | 'finalizado') => {
    if (!currentLote.processo || !currentLote.fornecedor || !currentLote.numeroLote) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha processo, fornecedor e número do lote.",
        variant: "destructive",
      });
      return;
    }

    const totalFileEmbalado = (currentLote.fileEmbalado?.P || 0) + 
                              (currentLote.fileEmbalado?.M || 0) + 
                              (currentLote.fileEmbalado?.G || 0) + 
                              (currentLote.fileEmbalado?.GG || 0);

    if (totalFileEmbalado === 0) {
      toast({
        title: "Filé embalado obrigatório",
        description: "Informe pelo menos um tamanho de filé embalado.",
        variant: "destructive",
      });
      return;
    }

    // Se está editando, pede senha antes de salvar
    if (isEditingLote) {
      setPendingStatus(status);
      setShowPasswordDialog(true);
      return;
    }

    // Se não está editando, salva diretamente
    await executeSave(status, '');
  };

  const executeSave = async (status: 'aberto' | 'finalizado', pwd: string) => {
    if (status === 'aberto') {
      setLoadingSubmitAberto(true);
    } else {
      setLoadingSubmit(true);
    }
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast({
          title: "Erro de autenticação",
          description: "Token não encontrado. Faça login novamente.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      // RECALCULAR TODOS OS CAMPOS antes de salvar
      const calcularTotal = (obj: any) => {
        if (!obj) return 0;
        return (obj.P || 0) + (obj.M || 0) + (obj.G || 0) + (obj.GG || 0);
      };

      // Recalcular filé embalado baseado em caixas e pacotes (embalagem)
      const tipoFile = currentLote.tipoFile || '400g';
      const gramatura = tipoFile === '400g' ? 400 : 800;
      const caixas = currentLote.caixas || currentLote.qtdMaster || 0;
      const pacotes = currentLote.pacotes || currentLote.qtdSacos || 0;
      const kgMaster = (caixas * (gramatura * 24)) / 1000;
      const kgSacos = (pacotes * gramatura) / 1000;
      const totalFileEmb = kgMaster + kgSacos;

      const novoFileEmbalado = {
        P: totalFileEmb,
        M: 0,
        G: 0,
        GG: 0
      };

      // Recalcular aproveitamentos
      const totalPesoNF = calcularTotal(currentLote.pesoNotaFiscal);
      const totalPesoSalao = calcularTotal(currentLote.pesoSalao);
      
      const aprovNF = totalPesoNF > 0 ? parseFloat(((totalFileEmb / totalPesoNF) * 100).toFixed(2)) : 0;
      const aprovSal = totalPesoSalao > 0 ? parseFloat(((totalFileEmb / totalPesoSalao) * 100).toFixed(2)) : 0;

      const loteData: Omit<LoteData, 'id'> = {
        ...currentLote,
        fileEmbalado: novoFileEmbalado,
        aprovNotaFiscal: aprovNF,
        aprovSalao: aprovSal,
        status: status,
      };

      let response;
      let savedLote;

      // Se está editando (tem ID), faz PUT, senão faz POST
      if (isEditingLote && currentLote.id) {
        const loteId = currentLote.id || (currentLote as any)._id;
        response = await fetch(`${API_URL}/lotes/${loteId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            ...loteData,
            password: pwd // Senha do diálogo
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao atualizar lote');
        }

        savedLote = await response.json();
        
        // Atualizar lote na lista
        setLotes(prev => prev.map(l => 
          (l.id === loteId || (l as any)._id === loteId) ? savedLote : l
        ));
      } else {
        // Criar novo lote
        response = await fetch(`${API_URL}/lotes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(loteData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao salvar lote');
        }

        savedLote = await response.json();
        
        // Adicionar novo lote na lista
        setLotes(prev => [savedLote, ...prev]);
      }

      // Normalizar lote: mapear _id para id
      const normalizedLote = {
        ...savedLote,
        id: savedLote.id || savedLote._id,
      };
      
      setCurrentLote(createEmptyLote());
      setIsEditingLote(false);
      setActiveTab('dashboard');

      toast({
        title: "Sucesso!",
        description: isEditingLote
          ? `Lote ${normalizedLote.numeroLote} foi atualizado com sucesso.`
          : status === 'aberto' 
            ? `Lote ${normalizedLote.numeroLote} foi salvo como ABERTO.`
            : `Lote ${normalizedLote.numeroLote} foi finalizado e salvo.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar lote",
        description: error.message || "Não foi possível salvar o lote no banco de dados.",
        variant: "destructive",
      });
      console.error('Erro ao salvar lote:', error);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleTabChange = (tab: 'dashboard' | 'entrada') => {
    setActiveTab(tab);
    if (tab === 'entrada') {
      // Só limpa o lote se não houver dados preenchidos
      if (!currentLote.processo && !currentLote.fornecedor && !currentLote.numeroLote) {
        setCurrentLote(createEmptyLote());
      }
    }
  };

  const handleConfirmPassword = async () => {
    if (!password.trim()) {
      toast({
        title: "Senha obrigatória",
        description: "Digite a senha para confirmar a edição.",
        variant: "destructive",
      });
      return;
    }

    setShowPasswordDialog(false);
    await executeSave(pendingStatus!, password);
    setPassword('');
    setPendingStatus(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={handleTabChange} onLogout={handleLogout} />

      <main className="container py-6">
        {activeTab === 'dashboard' && (
          <Dashboard 
            lotes={lotes}
            onLoteUpdate={(updatedLote) => {
              setLotes(prevLotes => 
                prevLotes.map(l => l.id === updatedLote.id ? updatedLote : l)
              );
            }}
            onLoadLoteForEdit={handleLoadLoteForEdit}
          />
        )}
        
        {activeTab === 'entrada' && (
          <RegistroEntrada
            lote={currentLote}
            onChange={handleLoteChange}
            onSubmit={handleRegistrarEntrada}
            loading={loadingSubmit}
            loadingAberto={loadingSubmitAberto}
            isEditing={isEditingLote}
            onCancel={() => {
              setCurrentLote(createEmptyLote());
              setIsEditingLote(false);
              setActiveTab('dashboard');
            }}
          />
        )}
      </main>

      {/* Diálogo de Senha */}
      {showPasswordDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Confirmar Edição</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Digite a senha para confirmar as alterações no lote:
            </p>
            <input
              type="password"
              placeholder="Digite a senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirmPassword()}
              className="w-full px-3 py-2 border rounded-lg mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordDialog(false);
                  setPassword('');
                  setPendingStatus(null);
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPassword}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
