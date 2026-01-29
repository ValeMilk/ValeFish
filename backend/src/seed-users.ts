import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './models/User';

dotenv.config();

const users = [
  {
    username: 'robert.matos',
    password: 'Valefish2026',
    name: 'Robert Regis Gomes Matos',
    role: 'admin' as const
  },
  {
    username: 'maria.marques',
    password: '63997',
    name: 'Maria Arianna Marques',
    role: 'operador' as const
  },
  {
    username: 'richard.yong',
    password: '52212',
    name: 'Richard William Venegas Yong',
    role: 'operador' as const
  }
];

async function seedUsers() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/valefish';
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado ao MongoDB');

    // Dropar índice antigo de email se existir
    try {
      await User.collection.dropIndex('email_1');
      console.log('🗑️  Índice email_1 removido');
    } catch (error) {
      // Índice não existe, continuar
    }

    // Deletar usuários existentes
    await User.deleteMany({});
    console.log('🗑️  Usuários anteriores removidos');

    // Criar novos usuários
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = new User({
        username: userData.username,
        password: hashedPassword,
        name: userData.name,
        role: userData.role
      });

      await user.save();
      console.log(`✅ Usuário criado: ${userData.name} (${userData.role})`);
    }

    console.log('\n🎉 Todos os usuários foram cadastrados com sucesso!');
    console.log('\n📋 Credenciais:');
    console.log('─────────────────────────────────────────────');
    users.forEach(u => {
      console.log(`👤 ${u.name}`);
      console.log(`   Username: ${u.username}`);
      console.log(`   Senha: ${u.password}`);
      console.log(`   Tipo: ${u.role.toUpperCase()}`);
      console.log('─────────────────────────────────────────────');
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao cadastrar usuários:', error);
    process.exit(1);
  }
}

seedUsers();
