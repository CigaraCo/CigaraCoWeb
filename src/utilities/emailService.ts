import { toast } from '@/components/ui/use-toast';
import emailjs from '@emailjs/browser';

const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

// Comprehensive test function
export const verifyEmailConfig = async (testEmail: string): Promise<boolean> => {
  try {
    console.log('Starting EmailJS configuration verification...');
    
    // Step 1: Check if all required values are present
    const configCheck = {
      publicKey: EMAILJS_PUBLIC_KEY ? 'Present' : 'Missing',
      serviceId: EMAILJS_SERVICE_ID ? 'Present' : 'Missing',
      templateId: EMAILJS_TEMPLATE_ID ? 'Present' : 'Missing'
    };
    
    console.log('Configuration check:', configCheck);
    
    if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
      throw new Error('Missing required EmailJS configuration values');
    }

    // Step 2: Initialize EmailJS
    emailjs.init(EMAILJS_PUBLIC_KEY);
    console.log('EmailJS initialized');

    // Step 3: Prepare test data - matching exactly with template variables
    const testData = {
      to_email: 'rashid.kandah@gmail.com',
      to_name: 'Test User',
      order_id: 'TEST-' + new Date().getTime(),
      items_list: 'Test Product 1: 1 x $10.00\nTest Product 2: 2 x $15.00',
      total: '25.00',
      customer_address: '123 Test Street, Test City',
      customer_phone: '123-456-7890',
      logo_url: 'https://cigara-co-boutique.vercel.app/logo.png',
      from_name: 'Cigára Co.' // <-- This was missing
    };

    console.log('Sending test email with data:', testData);
    console.log('Using Template ID:', EMAILJS_TEMPLATE_ID);


    // Step 4: Send test email
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      testData, // Send the test data directly
      EMAILJS_PUBLIC_KEY
    );

    console.log('Test email result:', result);

    if (result.status === 200) {
      toast({
        title: "Email Configuration Verified",
        description: `Test email sent successfully to ${testEmail}`,
      });
      return true;
    } else {
      throw new Error(`Unexpected status code: ${result.status}`);
    }

  } catch (error: any) {
    console.error('Email configuration verification failed:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      error: error
    });
    
    toast({
      title: "Configuration Test Failed",
      description: error.message || "Failed to verify email configuration",
      variant: "destructive",
    });
    return false;
  }
};

// Simple test function
export const testEmailConfig = async () => {
  try {
    console.log('Testing EmailJS configuration...');
    console.log('Config values:', {
      publicKey: EMAILJS_PUBLIC_KEY ? 'Present' : 'Missing',
      serviceId: EMAILJS_SERVICE_ID ? 'Present' : 'Missing',
      templateId: EMAILJS_TEMPLATE_ID ? 'Present' : 'Missing'
    });

    // Create a test template
    const templateParams = {
      to_email: 'test@example.com',
      to_name: 'Test User',
      order_id: 'TEST-123',
      items: [{
        name: 'Test Item',
        quantity: 1,
        price: '10.00',
        variant_name: ''
      }],
      total: '10.00',
      customer_address: 'Test Address',
      customer_phone: '123456789',
      logo_url: 'https://cigara-co-boutique.vercel.app/logo.png'
    };

    // Send using form approach
    const form = document.createElement('form');
    Object.keys(templateParams).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = typeof templateParams[key] === 'object' 
        ? JSON.stringify(templateParams[key]) 
        : templateParams[key];
      form.appendChild(input);
    });

    const result = await emailjs.sendForm(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      form,
      EMAILJS_PUBLIC_KEY
    );
    
    console.log('Test email result:', result);
    return true;
  } catch (error: any) {
    console.error('Test email error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    return false;
  }
};

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  variantName?: string;
}

interface OrderDetails {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: OrderItem[];
  total: number;
}

const formatItemsForTemplate = (items: OrderItem[]): string => {
  return items.map(item => {
    const variantInfo = item.variantName ? ` - ${item.variantName}` : '';
    return `${item.name}${variantInfo}: ${item.quantity} x $${item.price.toFixed(2)}`;
  }).join('\\n');
};

export const sendOrderConfirmationEmail = async (order: OrderDetails): Promise<boolean> => {
  try {
    console.log('EmailJS Configuration:', {
      publicKey: EMAILJS_PUBLIC_KEY ? 'Present' : 'Missing',
      serviceId: EMAILJS_SERVICE_ID ? 'Present' : 'Missing',
      templateId: EMAILJS_TEMPLATE_ID ? 'Present' : 'Missing'
    });

    // Initialize EmailJS
    emailjs.init(EMAILJS_PUBLIC_KEY);

    // Format items as a string
    const itemsList = formatItemsForTemplate(order.items);

    // Create template parameters
    const templateParams = {
      to_email: order.customer.email,
      to_name: order.customer.name,
      order_id: order.id,
      items_list: itemsList,
      total: order.total.toFixed(2),
      customer_address: order.customer.address,
      customer_phone: order.customer.phone,
      logo_url: 'https://cigara-co-boutique.vercel.app/logo.png'
    };

    console.log('Sending email with params:', templateParams);

    // Send email directly without form
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('EmailJS Response:', result);

    if (result.status === 200) {
      toast({
        title: "Order Confirmation Sent",
        description: "Please check your email for order details.",
      });
      return true;
    } else {
      throw new Error(`Failed to send email. Status: ${result.status}`);
    }

  } catch (error: any) {
    console.error('Detailed error sending email:', {
      message: error.message,
      stack: error.stack,
      error: error
    });
    
    toast({
      title: "Email sending failed",
      description: error.message || "An unexpected error occurred. Please try again or contact support.",
      variant: "destructive",
    });
    return false;
  }
};
