/**
 * GET /api/meta/roi
 *
 * Retorna ROI Real das campanhas (Ads vs Vendas Recuperadas)
 * FASE 3: Dashboard de ROI
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateUserROI } from '@/lib/roi-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const datePreset = (searchParams.get('date_preset') || 'last_30d') as any;

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    // Validar date_preset
    const validPresets = ['last_7d', 'last_30d', 'this_month', 'last_month'];
    if (!validPresets.includes(datePreset)) {
      return NextResponse.json({ error: 'Invalid date_preset' }, { status: 400 });
    }

    // Calcular ROI
    const roi = await calculateUserROI(userId, datePreset);

    if (!roi) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No campaigns found for this period',
      });
    }

    return NextResponse.json({
      success: true,
      data: roi,
    });
  } catch (error: any) {
    console.error('❌ Erro ao buscar ROI:', error);

    // Se erro da API Meta ou token expirado
    if (error.message.includes('Meta connection') || error.message.includes('Token expired')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to calculate ROI' },
      { status: 500 }
    );
  }
}
