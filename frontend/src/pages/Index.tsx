import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import RegistroEntrada from "@/components/RegistroEntrada";
import { LoteData, createEmptyLote } from "@/types/lote";

const Index = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'entrada'>('dashboard');
  const [lotes, setLotes] = useState<LoteData[]>([]);
  const [currentLote, setCurrentLote] = useState<LoteData>(createEmptyLote());

  const handleLoteChange = (field: keyof LoteData, value: any) => {
    setCurrentLote(prev => ({ ...prev, [field]: value }));
  };

  const handleRegistrarEntrada = () => {
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

    const novoLote: LoteData = {
      ...currentLote,
      status: 'finalizado',
    };

    setLotes(prev => [novoLote, ...prev]);
    setCurrentLote(createEmptyLote());
    setActiveTab('dashboard');

    toast({
      title: "Lote finalizado!",
      description: `Lote ${novoLote.numeroLote} foi criado com sucesso.`,
    });
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
      <Header activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="container py-6">
        {activeTab === 'dashboard' && <Dashboard lotes={lotes} />}
        
        {activeTab === 'entrada' && (
          <RegistroEntrada
            lote={currentLote}
            onChange={handleLoteChange}
            onSubmit={handleRegistrarEntrada}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
