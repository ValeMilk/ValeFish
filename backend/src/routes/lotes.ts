import { Router, Response } from 'express';
import { Lote } from '../models/Lote';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth';

const router = Router();

// Create Lote
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const lote = new Lote(req.body);
    await lote.save();
    res.status(201).json(lote);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get all Lotes
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const lotes = await Lote.find().sort({ createdAt: -1 });
    res.json(lotes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Lote by ID
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const lote = await Lote.findById(req.params.id);
    
    if (!lote) {
      return res.status(404).json({ error: 'Lote not found' });
    }

    res.json(lote);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update Lote
router.put('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const lote = await Lote.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!lote) {
      return res.status(404).json({ error: 'Lote not found' });
    }

    res.json(lote);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete Lote
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const lote = await Lote.findByIdAndDelete(req.params.id);

    if (!lote) {
      return res.status(404).json({ error: 'Lote not found' });
    }

    res.json({ message: 'Lote deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
