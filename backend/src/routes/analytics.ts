import { Router, Response } from 'express';
import { Lote } from '../models/Lote';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth';

const router = Router();

// Estatísticas Gerais
router.get('/stats/geral', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalLotes = await Lote.countDocuments();
    const lotesPorStatus = await Lote.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const pesoTotal = await Lote.aggregate([
      {
        $group: {
          _id: null,
          totalPesoNF: {
            $sum: {
              $add: [
                { $ifNull: ['$pesoNotaFiscal.P', 0] },
                { $ifNull: ['$pesoNotaFiscal.M', 0] },
                { $ifNull: ['$pesoNotaFiscal.G', 0] },
                { $ifNull: ['$pesoNotaFiscal.GG', 0] }
              ]
            }
          },
          totalFilé: {
            $sum: {
              $add: [
                { $ifNull: ['$fileEmbalado.P', 0] },
                { $ifNull: ['$fileEmbalado.M', 0] },
                { $ifNull: ['$fileEmbalado.G', 0] },
                { $ifNull: ['$fileEmbalado.GG', 0] }
              ]
            }
          }
        }
      }
    ]);

    const aproveitamentoMedio = await Lote.aggregate([
      {
        $group: {
          _id: null,
          aprovNF: { $avg: '$aprovNotaFiscal' },
          aprovSalao: { $avg: '$aprovSalao' }
        }
      }
    ]);

    res.json({
      totalLotes,
      lotesPorStatus,
      pesoTotal: pesoTotal[0] || { totalPesoNF: 0, totalFilé: 0 },
      aproveitamentoMedio: aproveitamentoMedio[0] || { aprovNF: 0, aprovSalao: 0 }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Estatísticas por Fornecedor
router.get('/stats/fornecedor', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await Lote.aggregate([
      {
        $group: {
          _id: '$fornecedor',
          totalLotes: { $sum: 1 },
          totalPeso: {
            $sum: {
              $add: [
                { $ifNull: ['$pesoNotaFiscal.P', 0] },
                { $ifNull: ['$pesoNotaFiscal.M', 0] },
                { $ifNull: ['$pesoNotaFiscal.G', 0] },
                { $ifNull: ['$pesoNotaFiscal.GG', 0] }
              ]
            }
          },
          totalFilé: {
            $sum: {
              $add: [
                { $ifNull: ['$fileEmbalado.P', 0] },
                { $ifNull: ['$fileEmbalado.M', 0] },
                { $ifNull: ['$fileEmbalado.G', 0] },
                { $ifNull: ['$fileEmbalado.GG', 0] }
              ]
            }
          },
          aproveitamentoMedio: { $avg: '$aprovNotaFiscal' }
        }
      },
      { $sort: { totalLotes: -1 } }
    ]);

    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Estatísticas por Tamanho de Peixe
router.get('/stats/tamanho', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await Lote.aggregate([
      {
        $facet: {
          pesoNotaFiscal: [
            {
              $group: {
                _id: null,
                P: { $sum: '$pesoNotaFiscal.P' },
                M: { $sum: '$pesoNotaFiscal.M' },
                G: { $sum: '$pesoNotaFiscal.G' },
                GG: { $sum: '$pesoNotaFiscal.GG' }
              }
            }
          ],
          fileEmbalado: [
            {
              $group: {
                _id: null,
                P: { $sum: '$fileEmbalado.P' },
                M: { $sum: '$fileEmbalado.M' },
                G: { $sum: '$fileEmbalado.G' },
                GG: { $sum: '$fileEmbalado.GG' }
              }
            }
          ]
        }
      }
    ]);

    res.json(stats[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Relatório por Data
router.get('/stats/periodo', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { dataInicio, dataFim } = req.query;

    const filter: any = {};
    if (dataInicio || dataFim) {
      filter.dataProducao = {};
      if (dataInicio) filter.dataProducao.$gte = dataInicio;
      if (dataFim) filter.dataProducao.$lte = dataFim;
    }

    const stats = await Lote.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$dataProducao',
          totalLotes: { $sum: 1 },
          totalPeso: {
            $sum: {
              $add: [
                { $ifNull: ['$pesoNotaFiscal.P', 0] },
                { $ifNull: ['$pesoNotaFiscal.M', 0] },
                { $ifNull: ['$pesoNotaFiscal.G', 0] },
                { $ifNull: ['$pesoNotaFiscal.GG', 0] }
              ]
            }
          },
          totalFilé: {
            $sum: {
              $add: [
                { $ifNull: ['$fileEmbalado.P', 0] },
                { $ifNull: ['$fileEmbalado.M', 0] },
                { $ifNull: ['$fileEmbalado.G', 0] },
                { $ifNull: ['$fileEmbalado.GG', 0] }
              ]
            }
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Dados completos para Power BI (com filtros)
router.get('/export', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fornecedor, status, dataInicio, dataFim } = req.query;

    const filter: any = {};
    if (fornecedor) filter.fornecedor = fornecedor;
    if (status) filter.status = status;
    if (dataInicio || dataFim) {
      filter.dataProducao = {};
      if (dataInicio) filter.dataProducao.$gte = dataInicio;
      if (dataFim) filter.dataProducao.$lte = dataFim;
    }

    const lotes = await Lote.find(filter).sort({ createdAt: -1 });

    // Transformar para formato melhor para Power BI
    const formatted = lotes.map(lote => ({
      _id: lote._id,
      dataProducao: lote.dataProducao,
      processo: lote.processo,
      fornecedor: lote.fornecedor,
      numeroLote: lote.numeroLote,
      numeroNF: lote.numeroNF,
      valorNF: lote.valorNF,
      
      pesoNF_P: lote.pesoNotaFiscal?.P || 0,
      pesoNF_M: lote.pesoNotaFiscal?.M || 0,
      pesoNF_G: lote.pesoNotaFiscal?.G || 0,
      pesoNF_GG: lote.pesoNotaFiscal?.GG || 0,
      pesoNF_Total: (lote.pesoNotaFiscal?.P || 0) + (lote.pesoNotaFiscal?.M || 0) + (lote.pesoNotaFiscal?.G || 0) + (lote.pesoNotaFiscal?.GG || 0),
      
      pesoSalao_P: lote.pesoSalao?.P || 0,
      pesoSalao_M: lote.pesoSalao?.M || 0,
      pesoSalao_G: lote.pesoSalao?.G || 0,
      pesoSalao_GG: lote.pesoSalao?.GG || 0,
      pesoSalao_Total: (lote.pesoSalao?.P || 0) + (lote.pesoSalao?.M || 0) + (lote.pesoSalao?.G || 0) + (lote.pesoSalao?.GG || 0),
      
      fileEmbalado_P: lote.fileEmbalado?.P || 0,
      fileEmbalado_M: lote.fileEmbalado?.M || 0,
      fileEmbalado_G: lote.fileEmbalado?.G || 0,
      fileEmbalado_GG: lote.fileEmbalado?.GG || 0,
      fileEmbalado_Total: (lote.fileEmbalado?.P || 0) + (lote.fileEmbalado?.M || 0) + (lote.fileEmbalado?.G || 0) + (lote.fileEmbalado?.GG || 0),
      
      aproveitamentoNF: lote.aprovNotaFiscal,
      aproveitamentoSalao: lote.aprovSalao,
      
      qtdMaster: lote.qtdMaster,
      qtdSacos: lote.qtdSacos,
      
      status: lote.status,
      createdAt: lote.createdAt,
      updatedAt: lote.updatedAt
    }));

    res.json({
      total: formatted.length,
      data: formatted
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
