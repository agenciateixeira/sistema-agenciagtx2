/**
 * Templates de Email para Recuperação de Carrinho Abandonado
 * Personalizáveis pelo usuário
 */

export interface CartItem {
  title: string;
  quantity: number;
  price: string;
  image_url?: string;
}

export interface AbandonedCartEmailData {
  customerName: string;
  items: CartItem[];
  cartTotal: string;
  currency: string;
  checkoutUrl: string;
  storeName: string;
  logoUrl?: string;
  customMessage?: string;
  senderName?: string;
  actionId?: string; // Para tracking de emails
}

export function getAbandonedCartEmailSubject(data: AbandonedCartEmailData): string {
  return `${data.customerName}, você esqueceu algo no carrinho - ${data.storeName}`;
}

export function getAbandonedCartEmailHTML(data: AbandonedCartEmailData): string {
  const itemsHTML = data.items
    .map((item) => {
      const imageHTML = item.image_url
        ? `<img src="${item.image_url}" alt="${item.title}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 15px; float: left;" />`
        : '';

      return `
        <tr>
          <td style="padding: 15px; border-bottom: 1px solid #eee;">
            ${imageHTML}
            <div>
              <strong style="font-size: 16px; color: #333;">${item.title}</strong><br/>
              <span style="color: #666; font-size: 14px;">Quantidade: ${item.quantity}</span><br/>
              <span style="color: #10b981; font-size: 16px; font-weight: bold;">${data.currency} ${item.price}</span>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');

  const customMessage = data.customMessage || 'Notamos que você deixou alguns produtos incríveis no seu carrinho. Não perca essa oportunidade!';
  const logoHTML = data.logoUrl
    ? `<img src="${data.logoUrl}" alt="${data.storeName}" style="max-width: 180px; height: auto; margin-bottom: 20px;" />`
    : '';
  const currentYear = new Date().getFullYear();

  // URLs de tracking
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sistema-agenciagtx2.vercel.app';
  const trackingPixelUrl = data.actionId ? `${appUrl}/api/track/open/${data.actionId}` : '';
  const trackingClickUrl = data.actionId
    ? `${appUrl}/api/track/click/${data.actionId}?url=${encodeURIComponent(data.checkoutUrl)}`
    : data.checkoutUrl;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Você esqueceu algo no carrinho!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              ${logoHTML}
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                Você esqueceu algo! 🛒
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">
                Seus produtos ainda estão esperando por você
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px 20px 40px;">
              <p style="margin: 0; font-size: 16px; color: #333; line-height: 1.6;">
                Olá <strong>${data.customerName}</strong>,
              </p>
              <p style="margin: 15px 0 0 0; font-size: 16px; color: #666; line-height: 1.6;">
                ${customMessage}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9fafb; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px; background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                    <strong style="font-size: 18px; color: #111827;">Seu Carrinho</strong>
                  </td>
                </tr>
                ${itemsHTML}
                <tr>
                  <td style="padding: 20px; text-align: right; background-color: #ffffff;">
                    <span style="font-size: 16px; color: #666;">Total:</span>
                    <strong style="font-size: 24px; color: #10b981; margin-left: 10px;">${data.currency} ${data.cartTotal}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <a href="${trackingClickUrl}" style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; font-size: 18px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                      Finalizar Compra →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 20px 0 0 0; text-align: center; font-size: 14px; color: #999;">
                ⚡ Seus produtos estão reservados por tempo limitado
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 10px; text-align: center;">
                    <span style="font-size: 24px;">🚚</span><br/>
                    <span style="font-size: 14px; color: #666;">Frete Grátis</span>
                  </td>
                  <td style="padding: 10px; text-align: center;">
                    <span style="font-size: 24px;">🔒</span><br/>
                    <span style="font-size: 14px; color: #666;">Compra Segura</span>
                  </td>
                  <td style="padding: 10px; text-align: center;">
                    <span style="font-size: 24px;">↩️</span><br/>
                    <span style="font-size: 14px; color: #666;">Devolução Fácil</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 14px; color: #666;">
                Você recebeu este email porque deixou produtos no carrinho em <strong>${data.storeName}</strong>
              </p>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">
                © ${currentYear} ${data.storeName}. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  ${trackingPixelUrl ? `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />` : ''}
</body>
</html>
  `;
}

export function getAbandonedCartEmailText(data: AbandonedCartEmailData): string {
  const itemsList = data.items
    .map((item) => `- ${item.title} (${item.quantity}x) - ${data.currency} ${item.price}`)
    .join('\n');

  return `
Olá ${data.customerName},

Você esqueceu alguns produtos no seu carrinho!

Seu Carrinho:
${itemsList}

Total: ${data.currency} ${data.cartTotal}

Finalize sua compra agora:
${data.checkoutUrl}

---
${data.storeName}
  `.trim();
}
