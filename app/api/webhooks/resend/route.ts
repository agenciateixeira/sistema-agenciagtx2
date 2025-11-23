import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Função para criar cliente Supabase (evita erro de build)
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase environment variables not configured');
  }

  return createClient(url, key);
}

// Verificação de assinatura do webhook Resend (usam Svix)
function verifySignature(payload: string, signature: string, secret: string): boolean {
  if (!secret) return true; // Em desenvolvimento, sem secret

  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('svix-signature') || '';
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET || '';

    // Verificar assinatura (se secret estiver configurado)
    if (webhookSecret && !verifySignature(rawBody, signature, webhookSecret)) {
      console.error('❌ Webhook signature verification failed');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(rawBody);
    console.log('📨 Received Resend webhook:', event.type);

    // Processar diferentes tipos de eventos
    switch (event.type) {
      case 'email.sent':
        await handleEmailSent(event.data);
        break;

      case 'email.delivered':
        await handleEmailDelivered(event.data);
        break;

      case 'email.opened':
        await handleEmailOpened(event.data);
        break;

      case 'email.clicked':
        await handleEmailClicked(event.data);
        break;

      case 'email.bounced':
        await handleEmailBounced(event.data);
        break;

      case 'email.complained':
        await handleEmailComplained(event.data);
        break;

      default:
        console.log('⚠️ Unknown event type:', event.type);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Handler: Email enviado com sucesso
async function handleEmailSent(data: any) {
  const { email_id, to, subject, created_at } = data;

  console.log(`✅ Email sent: ${email_id} to ${to}`);

  const supabase = getSupabaseClient();

  // Criar registro no banco
  const { error } = await supabase.from('EmailLog').insert({
    emailId: email_id,
    type: inferEmailType(subject),
    to: Array.isArray(to) ? to[0] : to,
    subject: subject,
    status: 'SENT',
    sentAt: created_at || new Date().toISOString(),
    metadata: { originalData: data },
    events: [{ type: 'sent', timestamp: new Date().toISOString(), data }],
  });

  if (error) {
    console.error('❌ Error saving email log:', error);
  }
}

// Handler: Email entregue
async function handleEmailDelivered(data: any) {
  const { email_id } = data;

  console.log(`📬 Email delivered: ${email_id}`);

  const supabase = getSupabaseClient();

  // Buscar registro existente
  const { data: existing } = await supabase
    .from('EmailLog')
    .select('events')
    .eq('emailId', email_id)
    .single();

  const updatedEvents = [
    ...(existing?.events || []),
    { type: 'delivered', timestamp: new Date().toISOString(), data },
  ];

  // Atualizar status
  const { error } = await supabase
    .from('EmailLog')
    .update({
      status: 'DELIVERED',
      deliveredAt: new Date().toISOString(),
      events: updatedEvents,
    })
    .eq('emailId', email_id);

  if (error) {
    console.error('❌ Error updating email log:', error);
  }
}

// Handler: Email aberto
async function handleEmailOpened(data: any) {
  const { email_id } = data;

  console.log(`👀 Email opened: ${email_id}`);

  const supabase = getSupabaseClient();

  const { data: existing } = await supabase
    .from('EmailLog')
    .select('events, status')
    .eq('emailId', email_id)
    .single();

  const updatedEvents = [
    ...(existing?.events || []),
    { type: 'opened', timestamp: new Date().toISOString(), data },
  ];

  // Só atualiza status se ainda não foi clicado
  const newStatus = existing?.status === 'CLICKED' ? 'CLICKED' : 'OPENED';

  const { error } = await supabase
    .from('EmailLog')
    .update({
      status: newStatus,
      openedAt: new Date().toISOString(),
      events: updatedEvents,
    })
    .eq('emailId', email_id);

  if (error) {
    console.error('❌ Error updating email log:', error);
  }
}

// Handler: Link clicado
async function handleEmailClicked(data: any) {
  const { email_id } = data;

  console.log(`🖱️ Email link clicked: ${email_id}`);

  const supabase = getSupabaseClient();

  const { data: existing } = await supabase
    .from('EmailLog')
    .select('events')
    .eq('emailId', email_id)
    .single();

  const updatedEvents = [
    ...(existing?.events || []),
    { type: 'clicked', timestamp: new Date().toISOString(), data },
  ];

  const { error } = await supabase
    .from('EmailLog')
    .update({
      status: 'CLICKED',
      clickedAt: new Date().toISOString(),
      events: updatedEvents,
    })
    .eq('emailId', email_id);

  if (error) {
    console.error('❌ Error updating email log:', error);
  }
}

// Handler: Email rejeitado (bounce)
async function handleEmailBounced(data: any) {
  const { email_id } = data;

  console.log(`❌ Email bounced: ${email_id}`);

  const supabase = getSupabaseClient();

  const { data: existing } = await supabase
    .from('EmailLog')
    .select('events')
    .eq('emailId', email_id)
    .single();

  const updatedEvents = [
    ...(existing?.events || []),
    { type: 'bounced', timestamp: new Date().toISOString(), data },
  ];

  const { error } = await supabase
    .from('EmailLog')
    .update({
      status: 'BOUNCED',
      bouncedAt: new Date().toISOString(),
      events: updatedEvents,
    })
    .eq('emailId', email_id);

  if (error) {
    console.error('❌ Error updating email log:', error);
  }
}

// Handler: Reclamação de spam
async function handleEmailComplained(data: any) {
  const { email_id } = data;

  console.log(`🚫 Email complained (spam): ${email_id}`);

  const supabase = getSupabaseClient();

  const { data: existing } = await supabase
    .from('EmailLog')
    .select('events')
    .eq('emailId', email_id)
    .single();

  const updatedEvents = [
    ...(existing?.events || []),
    { type: 'complained', timestamp: new Date().toISOString(), data },
  ];

  const { error } = await supabase
    .from('EmailLog')
    .update({
      status: 'COMPLAINED',
      events: updatedEvents,
    })
    .eq('emailId', email_id);

  if (error) {
    console.error('❌ Error updating email log:', error);
  }
}

// Inferir tipo de email baseado no assunto
function inferEmailType(subject: string): 'TEAM_INVITE' | 'NOTIFICATION' | 'REPORT' {
  if (subject.includes('convidado') || subject.includes('Convite')) {
    return 'TEAM_INVITE';
  }
  if (subject.includes('Relatório') || subject.includes('📊')) {
    return 'REPORT';
  }
  return 'NOTIFICATION';
}
