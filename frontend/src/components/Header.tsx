import { Package, LayoutDashboard, Menu, LogOut, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  activeTab: 'dashboard' | 'entrada';
  onTabChange: (tab: 'dashboard' | 'entrada') => void;
  onLogout?: () => void;
}

const Header = ({ activeTab, onTabChange, onLogout }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setIsAdmin(role === 'admin');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  return (
    <header className="header-ocean text-foreground">
      <div className="container py-4 md:py-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-3">
              <img 
                src="/Logo ValeFish.png" 
                alt="ValeFish Logo" 
                className="h-20 w-auto"
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="p-2 hover:bg-purple-500/20 rounded-lg transition-all text-purple-600 hover:text-purple-700 flex items-center gap-2"
                title="Painel Admin"
              >
                <Shield className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">Admin</span>
              </button>
            )}
              />
            </div>
          </div>
          
          {/* Mobile menu button and Logout */}
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-foreground/10 rounded-lg transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-all text-red-600 hover:text-red-700"
              title="Sair da conta"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex gap-2">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'dashboard'
                ? 'bg-foreground/10 backdrop-blur-sm'
                : 'hover:bg-foreground/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => onTabChange('entrada')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'entrada'
                ? 'bg-foreground/10 backdrop-blur-sm'
                : 'hover:bg-foreground/5'
            }`}
          >
            <Package className="w-4 h-4" />
            Registro de Entrada
          </button>
        </nav>

        {/* Navigation - Mobile */}
        {mobileMenuOpen && (
          <nav className="md:hidden flex flex-col gap-2 mt-4 pb-2 border-t border-foreground/20">
            <button
              onClick={() => {
                onTabChange('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'dashboard'
                  ? 'bg-foreground/10 backdrop-blur-sm'
                  : 'hover:bg-foreground/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => {
                onTabChange('entrada');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'entrada'
                  ? 'bg-foreground/10 backdrop-blur-sm'
                  : 'hover:bg-foreground/5'
              }`}
            >
              <Package className="w-4 h-4" />
              Registro de Entrada
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
