
import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail } from 'lucide-react';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get order details from location state
  const { orderId, email } = location.state || {};
  
  // If no order ID, redirect to home
  if (!orderId) {
    React.useEffect(() => {
      navigate('/');
    }, [navigate]);
    return null;
  }
  
  return (
    <MainLayout>
      <div className="container-custom py-16 md:py-20">
        <div className="max-w-xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <CheckCircle className="h-20 w-20 text-green-500" />
          </div>
          
          <h1 className="text-3xl font-medium text-charcoal mb-4">
            Thank You for Your Order!
          </h1>
          
          <p className="text-dark-gray mb-2">
            Your order #{orderId} has been confirmed.
          </p>
          
          <div className="bg-gray-50 p-6 rounded-lg mb-8 mt-8 flex items-center justify-center">
            <Mail className="h-6 w-6 text-charcoal mr-3" />
            <p className="text-dark-gray">
              An invoice was sent to your email {email && <span className="font-medium">{email}</span>}, because we care about the environment.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link to="/#products">
              <Button className="btn-secondary w-full md:w-auto">
                Continue Shopping
              </Button>
            </Link>
            
            <Link to="/">
              <Button className="btn-primary w-full md:w-auto">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderConfirmation;
