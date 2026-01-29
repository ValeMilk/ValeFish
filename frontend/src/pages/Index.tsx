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

      const loteData: Omit<LoteData, 'id'> = {
        ...currentLote,
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
            password: '' // Senha vazia para atualização via entrada (sem verificação)
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
    </div>
  );
};

export default Index;
