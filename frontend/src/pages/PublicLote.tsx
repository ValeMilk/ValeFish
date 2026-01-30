import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PrintableLote from '@/components/PrintableLote';
import { LoteData } from '@/types/lote';

const PublicLote = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lote, setLote] = useState<LoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLote = async () => {
      if (!id) {
        setError('ID do lote não encontrado');
        setLoading(false);
        return;
      }

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://72.61.62.17:4000/api';
        const response = await fetch(`${apiUrl}/lotes/public/${id}`);
        
        if (!response.ok) {
          throw new Error('Lote não encontrado');
        }

        const data = await response.json();
        setLote(data);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar lote');
      } finally {
        setLoading(false);
      }
    };

    fetchLote();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20">
        <div className="text-center">
          <img 
            src="/Logo ValeFish.png" 
            alt="ValeFish" 
            className="h-16 w-auto mx-auto mb-4 animate-pulse"
          />
          <p className="text-muted-foreground">Carregando lote...</p>
        </div>
      </div>
    );
  }

  if (error || !lote) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20">
        <div className="text-center">
          <img 
            src="/Logo ValeFish.png" 
            alt="ValeFish" 
            className="h-16 w-auto mb-4 mx-auto"
          />
          <h1 className="text-2xl font-bold text-red-600 mb-2">Erro</h1>
          <p className="text-muted-foreground mb-4">{error || 'Lote não encontrado'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <PrintableLote lote={lote} />
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-2"
          >
            Imprimir
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Fazer Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicLote;
