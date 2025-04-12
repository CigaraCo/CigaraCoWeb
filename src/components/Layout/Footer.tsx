
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 bg-charcoal text-cream mt-auto">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-medium text-cream mb-4">Cigára Co.</h3>
            <p className="text-cream/80 mb-4">
              Premium accessories for modern connoisseurs based in Amman, Jordan.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-medium text-cream mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-cream/80 hover:text-cream transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/#products" className="text-cream/80 hover:text-cream transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-cream/80 hover:text-cream transition-colors">
                  Cart
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-medium text-cream mb-4">Contact</h3>
            <p className="text-cream/80 mb-2">Amman, Jordan</p>
            <p className="text-cream/80 mb-2">info@cigaraco.com</p>
          </div>
        </div>
        
        <div className="border-t border-cream/20 mt-8 pt-8 flex items-center justify-between">
          <p className="text-cream/60">&copy; {currentYear} Cigára Co. All rights reserved.</p>
          
          <Link to="/admin">
            <Button variant="ghost" className="text-cream/60 hover:text-cream">
              <Shield className="mr-2 h-4 w-4" />
              Admin Portal
            </Button>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

