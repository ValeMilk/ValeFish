import { Router, Response } from 'express';
import { User } from '../models/User';
import { generateToken, hashPassword, comparePassword } from '../utils/auth';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth';

const router = Router();

// Get all users (public - for login dropdown)
router.get('/users-list', async (req, res) => {
  try {
    console.log('📍 Requisição recebida: GET /auth/users-list');
    
    const users = await User.find({}, { username: 1, name: 1, _id: 1 }).sort({ name: 1 });
    
    console.log(`✅ ${users.length} usuário(s) encontrado(s)`);
    
    res.status(200).json(users);
  } catch (error: any) {
    console.error('❌ Erro ao buscar usuários:', error.message);
    res.status(500).json({ 
      error: error.message,
      details: 'Erro ao conectar ao banco de dados'
    });
  }
});
    res.status(500).json({ error: error.message });
  }
});

// Register
router.post('/register', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username, password, name } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ error: 'Username, password and name are required' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await hashPassword(password);
    const user = new User({
      username,
      password: hashedPassword,
      name,
      role: 'operador',
    });

    await user.save();

    const token = generateToken(user._id.toString(), user.username, user.role);
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = generateToken(user._id.toString(), user.username, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
