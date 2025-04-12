
import React, { ReactNode } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAdmin } from '@/context/AdminContext';
import { 
  ShoppingBag, 
  Package, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const { isAuthenticated, logout } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  // Check if user is authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);
  
  const handleLogout = () => {
    logout();
    navigate('/admin');
  };
  
  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: ShoppingBag },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { path: '/admin/products', label: 'Products', icon: Package },
  ];
  
  if (!isAuthenticated) return null;
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Mobile header */}
      <header className="bg-charcoal text-white p-4 md:hidden flex items-center justify-between">
        <h1 className="text-xl font-medium">Cigára Co. Admin</h1>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-charcoal text-white">
            <div className="flex items-center h-16 mb-8">
              <h2 className="text-xl font-medium">Cigára Co. Admin</h2>
            </div>
            
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center p-3 rounded-md ${
                      location.pathname === item.path
                        ? 'bg-white/10 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </Link>
                );
              })}
              
              <button
                onClick={handleLogout}
                className="flex items-center p-3 rounded-md text-white/70 hover:text-white hover:bg-white/5 w-full text-left"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </nav>
          </SheetContent>
        </Sheet>
      </header>
      
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-charcoal text-white p-6">
        <div className="flex items-center h-16 mb-8">
          <h2 className="text-xl font-medium">Cigára Co. Admin</h2>
        </div>
        
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center p-3 rounded-md ${
                  location.pathname === item.path
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <button
          onClick={handleLogout}
          className="flex items-center p-3 rounded-md text-white/70 hover:text-white hover:bg-white/5 mt-auto"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-charcoal">{title}</h1>
        </div>
        
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
