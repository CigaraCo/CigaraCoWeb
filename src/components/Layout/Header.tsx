
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Header = () => {
  const { getItemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="py-6 bg-cream border-b border-charcoal/10">
      <div className="container-custom flex items-center justify-between">
        <Link to="/" className="text-2xl font-medium text-charcoal">
          Cigára Co.
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-dark-gray hover:text-charcoal transition-colors">
            Home
          </Link>
          <Link to="/#products" className="text-dark-gray hover:text-charcoal transition-colors">
            Products
          </Link>
          <Link to="/cart" className="relative">
            <ShoppingBag className="h-6 w-6 text-charcoal" />
            {getItemCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-charcoal text-cream text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {getItemCount()}
              </span>
            )}
          </Link>
        </nav>

        {/* Mobile Navigation */}
        <div className="flex items-center md:hidden">
          <Link to="/cart" className="relative mr-4">
            <ShoppingBag className="h-6 w-6 text-charcoal" />
            {getItemCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-charcoal text-cream text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {getItemCount()}
              </span>
            )}
          </Link>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6 text-charcoal" />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-cream">
              <nav className="flex flex-col space-y-6 mt-12">
                <Link 
                  to="/" 
                  className="text-xl text-dark-gray hover:text-charcoal transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/#products" 
                  className="text-xl text-dark-gray hover:text-charcoal transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Products
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
