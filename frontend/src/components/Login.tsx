import { useState } from 'react';
import { LogIn, User, Lock, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import FormInput from './FormInput';

interface LoginProps {
  onLoginSuccess: (token: string, user: any) => void;
}

const Login = ({ onLoginSuccess }: LoginProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    confirmPassword: '',
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Erro na conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          name: formData.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Erro na conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <img 
            src="/Logo ValeFish.png" 
            alt="ValeFish" 
            className="h-32 w-auto mx-auto"
          />
        </div>

        {/* Card de Login/Registro */}
        <div className="bg-background/80 backdrop-blur-sm rounded-2xl border border-primary/20 shadow-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {isLogin ? 'Fazer Login' : 'Criar Conta'}
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-300 flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
            {/* Username */}
            <FormInput
              label="Nome de Usuário"
              icon={<User className="w-4 h-4" />}
              placeholder="seu_usuario"
              value={formData.username}
              onChange={(v) => handleInputChange('username', v)}
            />

            {/* Name (apenas em registro) */}
            {!isLogin && (
              <FormInput
                label="Nome Completo"
                icon={<User className="w-4 h-4" />}
                placeholder="Seu Nome"
                value={formData.name}
                onChange={(v) => handleInputChange('name', v)}
              />
            )}

            {/* Password */}
            <FormInput
              label="Senha"
              icon={<Lock className="w-4 h-4" />}
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(v) => handleInputChange('password', v)}
            />

            {/* Confirm Password (apenas em registro) */}
            {!isLogin && (
              <FormInput
                label="Confirmar Senha"
                icon={<Lock className="w-4 h-4" />}
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(v) => handleInputChange('confirmPassword', v)}
              />
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="success"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              <LogIn className="w-5 h-5 mr-2" />
              {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
            </Button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground mb-2">
              {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            </p>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({
                  username: '',
                  password: '',
                  name: '',
                  confirmPassword: '',
                });
              }}
              className="text-primary font-semibold hover:underline transition-all"
            >
              {isLogin ? 'Criar uma' : 'Fazer login'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-sm mt-6">
          ValeFish © 2026 | Sistema de Gestão de Pescados
        </p>
      </div>
    </div>
  );
};

export default Login;
