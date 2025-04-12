
import { toast } from '@/components/ui/use-toast';

export interface EmailDetails {
  to: string;
  subject: string;
  body: string;
}

export const sendEmail = async (details: EmailDetails): Promise<boolean> => {
  // In a real app, you would use a mail service API here
  // For now, we'll log the details and simulate success
  
  try {
    console.log('Sending email to:', details.to);
    console.log('Subject:', details.subject);
    console.log('Body:', details.body);
    
    // Validate email format
    if (!isValidEmail(details.to)) {
      console.error('Invalid email address:', details.to);
      toast({
        title: "Invalid email address",
        description: "Please provide a valid email address.",
        variant: "destructive",
      });
      return false;
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For a real implementation, you would use a backend API here.
    // However, browser-side JavaScript cannot send emails directly due to security restrictions.
    // In a production app, you would:
    // 1. Call a server endpoint (e.g., fetch('/api/send-email', { method: 'POST', body: JSON.stringify(details) }))
    // 2. The server would use a service like SendGrid, Mailgun, etc. to send the actual email
    
    // For this demo, we'll show an informational toast about email limitations
    toast({
      title: "Email Functionality Note",
      description: "In a production environment, this would send a real email via a backend service. For now, check the console to see the email content.",
    });
    
    // Return success (in a real app, this would be the API response)
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    toast({
      title: "Email sending failed",
      description: "There was an error sending the email. Please try again.",
      variant: "destructive",
    });
    return false;
  }
};

// Email validation helper
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const generateOrderConfirmationEmail = (
  order: {
    id: string;
    customer: {
      name: string;
      email: string;
      phone: string;
      address: string;
    };
    items: {
      name: string;
      price: number;
      quantity: number;
    }[];
    total: number;
  }
): EmailDetails => {
  const itemsList = order.items
    .map(item => `${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`)
    .join('\n');

  const body = `
    Dear ${order.customer.name},

    Thank you for your order with Cigára Co.! We're processing your order and will deliver it soon.

    Order Details:
    Order ID: ${order.id}
    Date: ${new Date().toLocaleDateString()}

    Items:
    ${itemsList}

    Total: $${order.total.toFixed(2)}

    Delivery Address:
    ${order.customer.address}

    Payment Method: Cash On Delivery

    If you have any questions about your order, please contact us.

    Thank you for choosing Cigára Co.

    Best regards,
    The Cigára Co. Team
  `;

  return {
    to: order.customer.email,
    subject: `Cigára Co. Order Confirmation #${order.id}`,
    body: body,
  };
};
