import { NextRequest, NextResponse } from 'next/server';
import { trackEmailOpen } from '@/lib/email-service';

/**
 * GET /api/track/open/[actionId]
 * Tracking pixel para abertura de email
 * Retorna imagem 1x1 transparente
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { actionId: string } }
) {
  try {
    const { actionId } = params;

    // Registrar abertura de email
    await trackEmailOpen(actionId);

    // Retornar imagem 1x1 transparente (GIF)
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    return new NextResponse(pixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Content-Length': pixel.length.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('❌ Erro ao registrar abertura:', error);

    // Mesmo com erro, retornar pixel transparente para não quebrar o email
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    return new NextResponse(pixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
      },
    });
  }
}
