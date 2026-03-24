import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Pode levar tempo para analisar vídeos

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Prompt estruturado para extração de atributos
const ANALYSIS_PROMPT = `Você é um especialista em análise de criativos de Meta Ads. Analise esta imagem/vídeo e extraia TODOS os atributos visuais e estratégicos que podem impactar a performance de conversão.

Retorne um JSON estruturado com esta estrutura EXATA (valores são exemplos):

{
  "tangible_attributes": {
    "colors": {
      "dominant": "#FF5733",
      "palette": ["#FF5733", "#C70039", "#FFC300"],
      "color_harmony": "complementary"
    },
    "objects": ["person", "product", "text_overlay", "logo"],
    "faces_count": 1,
    "has_logo": true,
    "text_detected": ["50% OFF", "Compre Agora", "Frete Grátis"],
    "composition": {
      "rule_of_thirds": true,
      "symmetry": false,
      "focal_point": "center"
    },
    "brightness": 0.75,
    "contrast": 0.82,
    "visual_complexity": "medium"
  },
  "intangible_attributes": {
    "emotion": "urgency",
    "tone": "commercial",
    "aesthetic_score": 8.5,
    "professionalism": 7.0,
    "authenticity": 6.5,
    "hook_strength": 9.0,
    "information_density": "medium",
    "cta_prominence": 8.0,
    "narrative_flow": "problem_solution",
    "target_demographic": "women_25_45",
    "lifestyle_alignment": "aspirational"
  },
  "text_analysis": {
    "headline": "Perca 10kg em 30 dias!",
    "headline_length": 22,
    "headline_sentiment": "positive",
    "uses_numbers": true,
    "uses_emoji": false,
    "urgency_words": ["agora", "limitado", "hoje"],
    "power_words": ["garantido", "comprovado", "revolucionário"],
    "body_copy_length": 156,
    "call_to_action": "Saiba Mais",
    "cta_strength": 7.5
  },
  "hook_analysis": {
    "first_frame_impact": 9.0,
    "has_motion": true,
    "has_face_closeup": true,
    "has_bold_text": true,
    "attention_grabbers": ["quick_cuts", "unexpected_visual", "contrast"],
    "predicted_hook_rate": 0.65
  },
  "recommendations": [
    "Aumentar contraste do botão CTA em 30%",
    "Reduzir quantidade de texto na tela",
    "Adicionar urgência temporal (ex: '24h')",
    "Testar versão com rosto em primeiro plano"
  ],
  "strengths": ["strong_hook", "clear_value_prop", "authentic_tone"],
  "weaknesses": ["low_cta_contrast", "information_overload", "generic_headline"]
}

INSTRUÇÕES:
1. Seja PRECISO nos números (scores de 0-10)
2. Identifique TODOS os textos visíveis
3. Avalie a força do HOOK (primeiros 3 segundos) com atenção
4. Dê recomendações ACIONÁVEIS para melhorar performance
5. Foque em elementos que correlacionam com CTR, Hook Rate e CPA

Analise agora:`;

interface AnalyzeCreativeRequest {
  user_id: string;
  ad_id: string;
  ad_account_id: string;
  creative_url: string;
  creative_type: 'image' | 'video' | 'carousel';
  model?: 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'gemini-pro-latest'; // Modelos Gemini
}

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const body: AnalyzeCreativeRequest = await request.json();
    const { user_id, ad_id, ad_account_id, creative_url, creative_type, model = 'gemini-2.5-flash' } = body;

    console.log('[Analyze Creative] 🎨 Iniciando análise:', { ad_id, creative_type, model });

    if (!user_id || !ad_id || !creative_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Usar Service Role Key para bypassar RLS (operação do lado do servidor)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verificar se já existe análise recente (cache de 7 dias)
    const { data: existingAnalysis } = await supabaseAdmin
      .from('creative_analysis')
      .select('*')
      .eq('ad_id', ad_id)
      .eq('user_id', user_id)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingAnalysis && existingAnalysis.analysis_status === 'completed') {
      console.log('[Analyze Creative] 💾 Retornando análise em cache');
      return NextResponse.json({
        data: existingAnalysis,
        cached: true,
      });
    }

    // Criar registro de análise pendente
    const { data: analysisRecord, error: insertError } = await supabaseAdmin
      .from('creative_analysis')
      .insert({
        user_id,
        ad_id,
        ad_account_id,
        creative_url,
        creative_type,
        model_used: model,
        analysis_status: 'processing',
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Analyze Creative] ❌ Erro ao criar registro:', insertError);
      throw insertError;
    }

    console.log('[Analyze Creative] 🤖 Chamando', model);

    // Fetch da imagem para converter em base64 (necessário para Gemini)
    const imageResponse = await fetch(creative_url);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // Chamar Gemini Vision
    const geminiModel = genAI.getGenerativeModel({
      model: model,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2000,
        responseMimeType: 'application/json', // Força resposta JSON
      }
    });

    const result = await geminiModel.generateContent([
      ANALYSIS_PROMPT,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
    ]);

    const response = await result.response;
    const rawResponse = response.text();
    console.log('[Analyze Creative] 📊 Resposta recebida:', rawResponse.substring(0, 200));

    // Parse da resposta
    const analysis = JSON.parse(rawResponse);

    // Calcular custo (Gemini 1.5 Pro pricing: $0.00125/1K input chars, $0.005/1K output chars)
    // Aproximação: 1 token ≈ 4 chars
    const inputTokens = Math.ceil((ANALYSIS_PROMPT.length + base64Image.length / 4) / 4);
    const outputTokens = Math.ceil(rawResponse.length / 4);
    const costUsd = (inputTokens * 0.00000125) + (outputTokens * 0.000005);

    const processingTimeMs = Date.now() - startTime;

    // Atualizar registro com análise completa
    const { data: updatedAnalysis, error: updateError } = await supabaseAdmin
      .from('creative_analysis')
      .update({
        tangible_attributes: analysis.tangible_attributes || {},
        intangible_attributes: analysis.intangible_attributes || {},
        video_analysis: creative_type === 'video' ? analysis.video_analysis || {} : {},
        text_analysis: analysis.text_analysis || {},
        performance_correlation: {
          strengths: analysis.strengths || [],
          weaknesses: analysis.weaknesses || [],
          recommendations: analysis.recommendations || [],
          hook_analysis: analysis.hook_analysis || {},
        },
        raw_response: rawResponse,
        analysis_status: 'completed',
        processing_time_ms: processingTimeMs,
        cost_usd: costUsd,
        model_version: model,
      })
      .eq('id', analysisRecord.id)
      .select()
      .single();

    if (updateError) {
      console.error('[Analyze Creative] ❌ Erro ao atualizar análise:', updateError);
      throw updateError;
    }

    console.log('[Analyze Creative] ✅ Análise completa em', processingTimeMs, 'ms - Custo: $', costUsd.toFixed(4));

    return NextResponse.json({
      data: updatedAnalysis,
      cached: false,
      processing_time_ms: processingTimeMs,
      cost_usd: costUsd,
      tokens: {
        input: inputTokens,
        output: outputTokens,
      },
    });

  } catch (error: any) {
    const processingTimeMs = Date.now() - startTime;
    console.error('[Analyze Creative] ❌ Erro:', error);

    return NextResponse.json(
      {
        error: error.message || 'Failed to analyze creative',
        processing_time_ms: processingTimeMs,
      },
      { status: 500 }
    );
  }
}

// GET: Buscar análises existentes
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const ad_id = searchParams.get('ad_id');
    const ad_account_id = searchParams.get('ad_account_id');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!user_id) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }

    // Usar Service Role Key para bypassar RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    let query = supabaseAdmin
      .from('creative_analysis')
      .select('*')
      .eq('user_id', user_id)
      .eq('analysis_status', 'completed')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (ad_id) {
      query = query.eq('ad_id', ad_id);
    }

    if (ad_account_id) {
      query = query.eq('ad_account_id', ad_account_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      data: data || [],
      count: data?.length || 0,
    });

  } catch (error: any) {
    console.error('[Get Creative Analysis] ❌ Erro:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get analyses' },
      { status: 500 }
    );
  }
}
