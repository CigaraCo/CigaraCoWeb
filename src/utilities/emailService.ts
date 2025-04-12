
import { toast } from '@/components/ui/use-toast';

export interface EmailDetails {
  to: string;
  subject: string;
  body: string;
}

export const sendEmail = async (details: EmailDetails): Promise<boolean> => {
  try {
    // In a real application, this would call an API endpoint to send the email
    // For demo purposes, we'll just simulate a successful email send
    console.log('Sending email:', details);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate success
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
