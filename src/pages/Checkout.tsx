
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAdmin } from '@/context/AdminContext';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { sendEmail, generateOrderConfirmationEmail } from '@/utilities/emailService';

interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

const Checkout = () => {
  const { items, getCartTotal, clearCart } = useCart();
  const { orders, addOrder, products, updateProductStock } = useAdmin();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  // Check if there's enough stock for all items
  const checkStock = () => {
    const insufficientItems = items.filter(item => {
      const product = products.find(p => p.id === item.id);
      return product && product.stock < item.quantity;
    });
    
    if (insufficientItems.length > 0) {
      const itemNames = insufficientItems.map(item => item.name).join(', ');
      toast({
        title: "Insufficient stock",
        description: `We don't have enough stock for: ${itemNames}`,
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Check stock before proceeding
    if (!checkStock()) {
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Create order
      const newOrder = {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        customer: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        },
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total: getCartTotal(),
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
      };
      
      // Send confirmation email
      const emailDetails = generateOrderConfirmationEmail(newOrder);
      const emailSent = await sendEmail(emailDetails);
      
      if (!emailSent) {
        console.error('Failed to send order confirmation email');
        toast({
          title: "Email delivery issue",
          description: "We couldn't send the confirmation email. Please check your email address.",
          variant: "destructive",
        });
      }
      
      // Save order and update product stock
      addOrder(newOrder);
      updateProductStock(items.map(item => ({ id: item.id, quantity: item.quantity })));
      
      // Clear cart
      clearCart();
      
      // Show success message
      toast({
        title: "Order placed successfully",
        description: emailSent 
          ? "Thank you for your order. We've sent a confirmation to your email."
          : "Thank you for your order. We'll process it shortly.",
      });
      
      // Redirect to confirmation page
      navigate('/order-confirmation', { 
        state: { 
          orderId: newOrder.id, 
          email: formData.email 
        }
      });
    } catch (error) {
      console.error('Error processing order:', error);
      toast({
        title: "Something went wrong",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (items.length === 0) {
    navigate('/cart');
    return null;
  }
  
  return (
    <MainLayout>
      <div className="container-custom py-12">
        <h1 className="text-3xl font-medium text-charcoal mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-medium text-charcoal mb-6">Delivery Information</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Delivery Address</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-8">
                  <Button
                    type="submit"
                    className="btn-primary w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : "Place Order (Cash on Delivery)"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-medium text-charcoal mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                
                <div className="border-t border-gray-200 pt-3 flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md text-sm text-dark-gray">
                <p className="font-medium mb-2">Payment Method:</p>
                <p>Cash on Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Checkout;
