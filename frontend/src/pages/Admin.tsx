import { useState, useEffect } from 'react';
import { BarChart3, Users, Package, TrendingUp, DollarSign, Calendar, ArrowLeft, LogOut, User } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

interface Stats {
  totalLotes: {
    abertos: number;
    emProducao: number;
    finalizados: number;
    total: number;
  };
  kgProcessados: {
    hoje: number;
    semana: number;
    mes: number;
  };
  fornecedoresAtivos: number;
  valorTotal: number;
  graficos: {
    ultimosSete: Array<{ date: string; kg: number; count: number }>;
    porFornecedor: Array<{ _id: string; count: number; totalKg: number }>;
  };
}

interface User {
  _id: string;
  username: string;
  name: string;
  role: 'admin' | 'operador';
  createdAt: string;
}

interface ReportFilters {
  startDate: string;
  endDate: string;
  fornecedor: string;
  status: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'reports'>('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/login');
  };
  
  // User Management
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({ username: '', password: '', name: '', role: 'operador' as 'admin' | 'operador' });
  
  // Reports
  const [reportFilters, setReportFilters] = useState<ReportFilters>({
    startDate: '',
    endDate: '',
    fornecedor: 'todos',
    status: 'todos'
  });
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    if (activeTab === 'dashboard') loadStats();
    if (activeTab === 'users') loadUsers();
  }, [activeTab]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const handleSaveUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const method = editingUser ? 'PUT' : 'POST';
      const url = editingUser 
        ? `${API_URL}/admin/users/${editingUser._id}`
        : `${API_URL}/admin/users`;

      const body = editingUser && !userForm.password
        ? { name: userForm.name, role: userForm.role }
        : userForm;

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        loadUsers();
        setShowUserModal(false);
        setUserForm({ username: '', password: '', name: '', role: 'operador' });
        setEditingUser(null);
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) loadUsers();
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams(reportFilters as any);
      const response = await fetch(`${API_URL}/admin/reports?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    }
  };

  if (loading && activeTab === 'dashboard') {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-gradient-to-br from-ocean-dark to-ocean-light shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <img 
                src="/Logo ValeFish.png" 
                alt="ValeFish Logo" 
                className="h-24 w-auto"
              />
              <div className="hidden md:block h-16 w-px bg-white/30"></div>
              <h1 className="hidden md:block text-2xl font-bold text-white">Painel Administrativo</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/30"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Visão Operador</span>
              </Button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 hover:bg-red-500/20 rounded-lg transition-all text-white hover:text-red-200 flex items-center gap-2 border border-red-300/30"
                title="Sair da conta"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 md:hidden">Painel Administrativo</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`pb-4 px-6 font-semibold transition-colors ${
              activeTab === 'dashboard'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 className="w-5 h-5 inline mr-2" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 px-6 font-semibold transition-colors ${
              activeTab === 'users'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" />
            Usuários
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-4 px-6 font-semibold transition-colors ${
              activeTab === 'reports'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar className="w-5 h-5 inline mr-2" />
            Relatórios
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total de Lotes</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalLotes.total}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {stats.totalLotes.abertos} abertos • {stats.totalLotes.finalizados} finalizados
                    </p>
                  </div>
                  <Package className="w-12 h-12 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Kg (Mês)</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.kgProcessados.mes.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Hoje: {stats.kgProcessados.hoje} kg
                    </p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Fornecedores</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.fornecedoresAtivos}</p>
                    <p className="text-xs text-gray-400 mt-2">Ativos</p>
                  </div>
                  <Users className="w-12 h-12 text-purple-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Valor Total</p>
                    <p className="text-3xl font-bold text-gray-800">R$ {stats.valorTotal.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-2">Lotes finalizados</p>
                  </div>
                  <DollarSign className="w-12 h-12 text-yellow-500" />
                </div>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Linha - Últimos 7 dias */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Kg Processados (Últimos 7 dias)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.graficos.ultimosSete}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="kg" stroke="#0088FE" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Pizza - Por Fornecedor */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Distribuição por Fornecedor (Kg)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.graficos.porFornecedor}
                      dataKey="totalKg"
                      nameKey="_id"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {stats.graficos.porFornecedor.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
              <Button onClick={() => {
                setEditingUser(null);
                setUserForm({ username: '', password: '', name: '', role: 'operador' });
                setShowUserModal(true);
              }}>
                Novo Usuário
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Nome</th>
                    <th className="text-left py-3 px-4">Username</th>
                    <th className="text-left py-3 px-4">Permissão</th>
                    <th className="text-left py-3 px-4">Criado em</th>
                    <th className="text-right py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{user.name}</td>
                      <td className="py-3 px-4">{user.username}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          onClick={() => {
                            setEditingUser(user);
                            setUserForm({ username: user.username, password: '', name: user.name, role: user.role });
                            setShowUserModal(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          Deletar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal de Usuário */}
            {showUserModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4">
                    {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Username</label>
                      <input
                        type="text"
                        value={userForm.username}
                        onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                        disabled={!!editingUser}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Senha {editingUser && '(deixe em branco para manter)'}
                      </label>
                      <input
                        type="password"
                        value={userForm.password}
                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Nome</label>
                      <input
                        type="text"
                        value={userForm.name}
                        onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Permissão</label>
                      <select
                        value={userForm.role}
                        onChange={(e) => setUserForm({ ...userForm, role: e.target.value as 'admin' | 'operador' })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="operador">Operador</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button onClick={handleSaveUser} className="flex-1">
                      Salvar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowUserModal(false);
                        setEditingUser(null);
                        setUserForm({ username: '', password: '', name: '', role: 'operador' });
                      }}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">Gerar Relatório</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Data Inicial</label>
                  <input
                    type="date"
                    value={reportFilters.startDate}
                    onChange={(e) => setReportFilters({ ...reportFilters, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Data Final</label>
                  <input
                    type="date"
                    value={reportFilters.endDate}
                    onChange={(e) => setReportFilters({ ...reportFilters, endDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Fornecedor</label>
                  <select
                    value={reportFilters.fornecedor}
                    onChange={(e) => setReportFilters({ ...reportFilters, fornecedor: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="todos">Todos</option>
                    <option value="VALEFISH">VALEFISH</option>
                    <option value="NORFISH">NORFISH</option>
                    <option value="CARLITO">CARLITO</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={reportFilters.status}
                    onChange={(e) => setReportFilters({ ...reportFilters, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="todos">Todos</option>
                    <option value="aberto">Aberto</option>
                    <option value="em_producao">Em Produção</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                </div>
              </div>

              <Button onClick={handleGenerateReport}>
                Gerar Relatório
              </Button>
            </div>

            {reportData && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold mb-4">Resultado do Relatório</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total de Lotes</p>
                    <p className="text-2xl font-bold text-blue-600">{reportData.totais.lotes}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total Kg</p>
                    <p className="text-2xl font-bold text-green-600">{reportData.totais.kgTotal.toLocaleString()}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Valor Total</p>
                    <p className="text-2xl font-bold text-yellow-600">R$ {reportData.totais.valorTotal.toLocaleString()}</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Lote</th>
                        <th className="text-left py-3 px-4">Fornecedor</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Data</th>
                        <th className="text-right py-3 px-4">Valor NF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.lotes.map((lote: any) => (
                        <tr key={lote._id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{lote.numeroLote}</td>
                          <td className="py-3 px-4">{lote.fornecedor}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              lote.status === 'finalizado' ? 'bg-green-100 text-green-700' :
                              lote.status === 'aberto' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {lote.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">{new Date(lote.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 px-4 text-right">R$ {(lote.valorNF || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
