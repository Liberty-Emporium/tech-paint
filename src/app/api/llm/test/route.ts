import { NextRequest, NextResponse } from 'next/server';

// Test LLM connection via OpenRouter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { llmApiKey, llmModel, llmTemperature, llmMaxTokens } = body;

    if (!llmApiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 400 });
    }

    const model = llmModel || 'meta-llama/llama-3.1-8b-instruct:free';
    const temperature = llmTemperature ?? 0.7;
    const max_tokens = llmMaxTokens ?? 4000;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${llmApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://tech-paint-production.up.railway.app',
        'X-Title': 'TechPaint',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are TechPaint AI, a friendly painting estimate assistant. Be brief.',
          },
          {
            role: 'user',
            content: 'Say "Hello from TechPaint! I can help you generate painting estimates." in a short, friendly way.',
          },
        ],
        temperature,
        max_tokens: Math.min(max_tokens, 200),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenRouter error:', response.status, err);
      return NextResponse.json(
        { error: `OpenRouter returned ${response.status}: ${err.substring(0, 300)}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      response: text,
      model,
      usage: data.usage || null,
    });
  } catch (error) {
    console.error('LLM test error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'LLM test failed' },
      { status: 500 }
    );
  }
}