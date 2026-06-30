import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
}

const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@zohrae.com";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Zohraé";

export async function sendOrderConfirmation(
  to: string,
  data: {
    orderNumber: string;
    customerName: string;
    total: string;
    items: Array<{ name: string; quantity: number; price: string }>;
  }
) {
  const resend = getResend();
  return resend.emails.send({
    from: `${APP_NAME} <${FROM}>`,
    to,
    subject: `Order Confirmed - ${data.orderNumber}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #fafaf8;">
        <h1 style="text-align: center; color: #1a1a1a; font-size: 28px; letter-spacing: 2px; margin-bottom: 8px;">${APP_NAME}</h1>
        <p style="text-align: center; color: #666; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 40px;">Order Confirmation</p>
        <h2 style="color: #1a1a1a; font-size: 20px;">Thank you, ${data.customerName}</h2>
        <p style="color: #444; line-height: 1.6;">Your order <strong>${data.orderNumber}</strong> has been confirmed and is being prepared with care.</p>
        <div style="border: 1px solid #e8e8e8; padding: 24px; margin: 24px 0; background: white;">
          ${data.items.map((item) => `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
              <span style="color: #333;">${item.name} × ${item.quantity}</span>
              <span style="color: #333; font-weight: 600;">${item.price}</span>
            </div>
          `).join("")}
          <div style="display: flex; justify-content: space-between; padding: 16px 0 0; font-weight: 700; font-size: 16px;">
            <span>Total</span>
            <span>${data.total}</span>
          </div>
        </div>
        <p style="color: #888; font-size: 12px; text-align: center; margin-top: 40px;">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(to: string, name: string) {
  const resend = getResend();
  return resend.emails.send({
    from: `${APP_NAME} <${FROM}>`,
    to,
    subject: `Welcome to ${APP_NAME}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #fafaf8;">
        <h1 style="text-align: center; color: #1a1a1a; font-size: 28px; letter-spacing: 2px;">${APP_NAME}</h1>
        <h2 style="color: #1a1a1a; margin-top: 40px;">Welcome, ${name}</h2>
        <p style="color: #444; line-height: 1.8;">Thank you for joining ${APP_NAME}. Discover our curated collection of fine jewelry.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="display: inline-block; margin-top: 24px; padding: 14px 32px; background: #1a1a1a; color: white; text-decoration: none; letter-spacing: 1px; font-size: 13px;">SHOP NOW</a>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const resend = getResend();
  return resend.emails.send({
    from: `${APP_NAME} <${FROM}>`,
    to,
    subject: "Reset Your Password",
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #fafaf8;">
        <h1 style="text-align: center; color: #1a1a1a; font-size: 28px; letter-spacing: 2px;">${APP_NAME}</h1>
        <h2 style="color: #1a1a1a; margin-top: 40px;">Password Reset Request</h2>
        <p style="color: #444; line-height: 1.8;">We received a request to reset your password. Click the button below to proceed.</p>
        <a href="${resetUrl}" style="display: inline-block; margin-top: 24px; padding: 14px 32px; background: #1a1a1a; color: white; text-decoration: none; letter-spacing: 1px; font-size: 13px;">RESET PASSWORD</a>
        <p style="color: #888; font-size: 12px; margin-top: 24px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
}

export async function sendLowStockAlert(
  to: string,
  products: Array<{ name: string; sku: string; stock: number }>
) {
  const resend = getResend();
  return resend.emails.send({
    from: `${APP_NAME} <${FROM}>`,
    to,
    subject: "Low Stock Alert",
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h2>Low Stock Alert</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background: #f5f5f5;">
            <th style="padding: 8px; text-align: left;">Product</th>
            <th style="padding: 8px; text-align: left;">SKU</th>
            <th style="padding: 8px; text-align: right;">Stock</th>
          </tr>
          ${products.map((p) => `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${p.name}</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${p.sku}</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; color: #e53e3e;">${p.stock}</td>
            </tr>
          `).join("")}
        </table>
      </div>
    `,
  });
}
