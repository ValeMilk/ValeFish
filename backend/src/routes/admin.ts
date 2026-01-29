import express from 'express';
import { User } from '../models/User';
import { Lote } from '../models/Lote';
import { authMiddleware } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminAuth';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Todas as rotas requerem autenticação e permissão de admin
router.use(authMiddleware);
router.use(requireAdmin);

// Estatísticas do Dashboard
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total de lotes por status
    const lotesAbertos = await Lote.countDocuments({ status: 'aberto' });
    const lotesEmProducao = await Lote.countDocuments({ status: 'em_producao' });
    const lotesFinalizados = await Lote.countDocuments({ status: 'finalizado' });

    // Kg processados (lotes finalizados)
    const lotesFinalizadosHoje = await Lote.find({
      status: 'finalizado',
      updatedAt: { $gte: startOfToday }
    });
    const kgHoje = lotesFinalizadosHoje.reduce((sum, lote) => {
      const total = (lote.fileEmbalado?.P || 0) + (lote.fileEmbalado?.M || 0) + 
                    (lote.fileEmbalado?.G || 0) + (lote.fileEmbalado?.GG || 0);
      return sum + total;
    }, 0);

    const lotesFinalizadosSemana = await Lote.find({
      status: 'finalizado',
      updatedAt: { $gte: startOfWeek }
    });
    const kgSemana = lotesFinalizadosSemana.reduce((sum, lote) => {
      const total = (lote.fileEmbalado?.P || 0) + (lote.fileEmbalado?.M || 0) + 
                    (lote.fileEmbalado?.G || 0) + (lote.fileEmbalado?.GG || 0);
      return sum + total;
    }, 0);

    const lotesFinalizadosMes = await Lote.find({
      status: 'finalizado',
      updatedAt: { $gte: startOfMonth }
    });
    const kgMes = lotesFinalizadosMes.reduce((sum, lote) => {
      const total = (lote.fileEmbalado?.P || 0) + (lote.fileEmbalado?.M || 0) + 
                    (lote.fileEmbalado?.G || 0) + (lote.fileEmbalado?.GG || 0);
      return sum + total;
    }, 0);

    // Fornecedores ativos (que têm lotes)
    const fornecedoresAtivos = await Lote.distinct('fornecedor');

    // Valor total em R$ (lotes finalizados)
    const lotesComValor = await Lote.find({ status: 'finalizado', valorNF: { $exists: true } });
    const valorTotal = lotesComValor.reduce((sum, lote) => sum + (lote.valorNF || 0), 0);

    // Dados para gráficos - últimos 7 dias
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);

      const lotesFinalizadosDia = await Lote.find({
        status: 'finalizado',
        updatedAt: { $gte: date, $lt: nextDay }
      });

      const kgDia = lotesFinalizadosDia.reduce((sum, lote) => {
        const total = (lote.fileEmbalado?.P || 0) + (lote.fileEmbalado?.M || 0) + 
                      (lote.fileEmbalado?.G || 0) + (lote.fileEmbalado?.GG || 0);
        return sum + total;
      }, 0);

      last7Days.push({
        date: date.toISOString().split('T')[0],
        kg: parseFloat(kgDia.toFixed(2)),
        count: lotesFinalizadosDia.length
      });
    }

    // Distribuição por fornecedor
    const distribuicaoFornecedor = await Lote.aggregate([
      { $match: { status: 'finalizado' } },
      {
        $group: {
          _id: '$fornecedor',
          count: { $sum: 1 },
          totalKg: {
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
      { $sort: { totalKg: -1 } }
    ]);

    res.json({
      totalLotes: {
        abertos: lotesAbertos,
        emProducao: lotesEmProducao,
        finalizados: lotesFinalizados,
        total: lotesAbertos + lotesEmProducao + lotesFinalizados
      },
      kgProcessados: {
        hoje: parseFloat(kgHoje.toFixed(2)),
        semana: parseFloat(kgSemana.toFixed(2)),
        mes: parseFloat(kgMes.toFixed(2))
      },
      fornecedoresAtivos: fornecedoresAtivos.length,
      valorTotal: parseFloat(valorTotal.toFixed(2)),
      graficos: {
        ultimosSete: last7Days,
        porFornecedor: distribuicaoFornecedor
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas' });
  }
});

// Listar todos os usuários
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ message: 'Erro ao listar usuários' });
  }
});

// Criar usuário
router.post('/users', async (req, res) => {
  try {
    const { username, password, name, role } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ message: 'Campos obrigatórios faltando' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
      name,
      role: role || 'operador'
    });

    await user.save();

    const userResponse = user.toObject();
    delete (userResponse as any).password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ message: 'Erro ao criar usuário' });
  }
});

// Atualizar usuário
router.put('/users/:id', async (req, res) => {
  try {
    const { name, role, password } = req.body;
    const updateData: any = { name, role };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar usuário' });
  }
});

// Deletar usuário
router.delete('/users/:id', async (req: any, res) => {
  try {
    // Não permitir deletar a si mesmo
    if (req.user && req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Não é possível deletar seu próprio usuário' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ message: 'Erro ao deletar usuário' });
  }
});

// Relatórios com filtros
router.get('/reports', async (req, res) => {
  try {
    const { startDate, endDate, fornecedor, status } = req.query;

    const filter: any = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    if (fornecedor && fornecedor !== 'todos') {
      filter.fornecedor = fornecedor;
    }

    if (status && status !== 'todos') {
      filter.status = status;
    }

    const lotes = await Lote.find(filter).sort({ createdAt: -1 });

    // Calcular totais
    const totais = {
      lotes: lotes.length,
      valorTotal: lotes.reduce((sum, l) => sum + (l.valorNF || 0), 0),
      kgTotal: lotes.reduce((sum, l) => {
        const total = (l.fileEmbalado?.P || 0) + (l.fileEmbalado?.M || 0) + 
                      (l.fileEmbalado?.G || 0) + (l.fileEmbalado?.GG || 0);
        return sum + total;
      }, 0)
    };

    res.json({
      lotes,
      totais: {
        ...totais,
        valorTotal: parseFloat(totais.valorTotal.toFixed(2)),
        kgTotal: parseFloat(totais.kgTotal.toFixed(2))
      },
      filtros: { startDate, endDate, fornecedor, status }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ message: 'Erro ao gerar relatório' });
  }
});

export default router;
