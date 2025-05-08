// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'resend'

console.log("Hello from Functions!")

// Get the Resend API key from environment variables
const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

serve(async (req) => {
  const { customer_email, customer_name, order_id, items, total } = await req.json()

  try {
    await resend.emails.send({
      from: 'Cigára Co. <info.cigaraco@gmail.com>',
      to: customer_email,
      subject: 'Your Cigára Co. Order Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; font-size: 24px;">Cigára Co.</h1>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
            <h2 style="color: #333; margin-bottom: 20px;">Thank you for your order, ${customer_name}!</h2>
            
            <p style="color: #666; margin-bottom: 15px;">Your order #${order_id} has been confirmed and is being processed.</p>
            
            <div style="margin: 20px 0;">
              <h3 style="color: #333; margin-bottom: 10px;">Order Details:</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                ${items.map((item: any) => `
                  <li style="margin-bottom: 10px; padding: 10px; background-color: #fff; border-radius: 3px;">
                    ${item.name} - ${item.quantity} x $${item.price}
                  </li>
                `).join("")}
              </ul>
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #333; font-weight: bold; margin: 0;">
                Total: $${total}
              </p>
            </div>
          </div>
          
          <div style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
            <p>If you have any questions about your order, please contact us at support@cigaraco.com</p>
            <p style="margin-top: 10px;">© ${new Date().getFullYear()} Cigára Co. All rights reserved.</p>
          </div>
        </div>
      `
    })

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })
  } catch (error) {
    console.error('Failed to send email:', error)
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-confirmation' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
