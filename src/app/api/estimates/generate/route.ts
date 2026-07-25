import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { readFileSync, existsSync } from 'fs';

declare global {
  // eslint-disable-next-line no-var
  var __estimates: Record<string, any> | undefined;
}
const store: Record<string, any> = global.__estimates || (global.__estimates = {});

function readSettings() {
  try {
    const path = '/home/django/tech-paint/settings.json';
    if (existsSync(path)) {
      return JSON.parse(readFileSync(path, 'utf-8'));
    }
  } catch {}
  return {};
}

// Try to generate an AI-powered estimate via OpenRouter.
// Returns null if no API key or on failure; caller falls back to rule-based.
async function tryAIEstimate(
  apiKey: string,
  model: string,
  temperature: number,
  maxTokens: number,
  info: {
    customerName: string;
    propertyDescription: string;
    roomType: string;
    squareFootage: string;
    notes: string;
  }
): Promise<{ items: Array<{ id: string; description: string; quantity: number; unitPrice: number; total: number }>; total: number } | null> {
  try {
    const prompt = `You are a professional painting contractor estimating tool. Based on the following project details, generate a detailed estimate.

Customer: ${info.customerName}
Project: ${info.propertyDescription}
Room/Area type: ${info.roomType || 'interior'}
Square footage: ${info.squareFootage || 'unknown'} sq ft
Notes: ${info.notes || 'none'}

Respond with ONLY valid JSON in this format, nothing else:
{
  "items": [
    {"description": "line item description", "quantity": 500, "unitPrice": 2.50, "total": 1250.00}
  ],
  "total": 1250.00
}

Include realistic line items for paint, labor, prep work, materials, etc. Use current market rates for professional painting in the US.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://tech-paint-production.up.railway.app',
        'X-Title': 'TechPaint',
      },
      body: JSON.stringify({
        model: model || 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          { role: 'system', content: 'You are a painting estimate generator. Respond with ONLY valid JSON, no markdown, no explanation.' },
          { role: 'user', content: prompt },
        ],
        temperature: temperature ?? 0.7,
        max_tokens: maxTokens ?? 4000,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim() || '';

    // Strip markdown code fences if present
    const jsonStr = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(jsonStr);

    if (parsed.items && Array.isArray(parsed.items)) {
      const items = parsed.items.map((item: any) => ({
        id: uuidv4(),
        description: String(item.description || item.name || 'Line item'),
        quantity: Number(item.quantity) || 1,
        unitPrice: Math.round(Number(item.unitPrice || item.price || 0) * 100) / 100,
        total: Math.round(Number(item.total || (item.quantity || 1) * (item.unitPrice || item.price || 0)) * 100) / 100,
      }));
      const total = items.reduce((sum: number, i: any) => sum + i.total, 0);
      return { items, total: Math.round(total * 100) / 100 };
    }
    return null;
  } catch (err) {
    console.error('AI estimate failed, falling back to rule-based:', err);
    return null;
  }
}

// Rule-based fallback when AI is not configured or fails.
function ruleBasedEstimate(roomType: string, squareFootageRaw: string) {
  const squareFootage = parseInt(squareFootageRaw || '0', 10) || 0;
  const rateByRoom: Record<string, number> = {
    interior: 2.5, exterior: 3.5, cabinet: 6.0,
    deck: 4.0, ceiling: 3.0, trim: 1.5,
  };
  const rate = rateByRoom[roomType?.toLowerCase()] || 3.0;
  const paintCost = squareFootage * rate;
  const laborCost = paintCost * 0.6;
  const subtotal = paintCost + laborCost;
  const tax = subtotal * 0.08;
  const total = Math.round((subtotal + tax) * 100) / 100;
  const label = roomType ? roomType.charAt(0).toUpperCase() + roomType.slice(1) : 'Interior';

  return {
    items: [
      { id: uuidv4(), description: `${label} painting (${squareFootage} sq ft @ $${rate}/sq ft)`, quantity: squareFootage || 1, unitPrice: rate, total: Math.round(paintCost * 100) / 100 },
      { id: uuidv4(), description: 'Labor', quantity: 1, unitPrice: Math.round(laborCost * 100) / 100, total: Math.round(laborCost * 100) / 100 },
    ],
    total,
  };
}

export async function POST(request: NextRequest) {
  try {
    const ct = request.headers.get('content-type') || '';
    let customerName: string, customerEmail: string, customerPhone: string,
        customerAddress: string, propertyDescription: string, roomType: string,
        squareFootageRaw: string, notes: string, photos: File[] = [];

    if (ct.includes('application/json')) {
      const body = await request.json();
      customerName   = body.customerName   || '';
      customerEmail  = body.customerEmail  || '';
      customerPhone  = body.customerPhone  || '';
      customerAddress = body.customerAddress || '';
      propertyDescription = body.propertyDescription || '';
      roomType       = body.roomType       || '';
      squareFootageRaw    = body.squareFootage    || '';
      notes          = body.notes          || '';
    } else {
      const formData = await request.formData();
      customerName   = (formData.get('customerName')   as string) || '';
      customerEmail  = (formData.get('customerEmail')  as string) || '';
      customerPhone  = (formData.get('customerPhone')  as string) || '';
      customerAddress = (formData.get('customerAddress') as string) || '';
      propertyDescription = (formData.get('propertyDescription') as string) || '';
      roomType       = (formData.get('roomType')       as string) || '';
      squareFootageRaw    = (formData.get('squareFootage')    as string) || '';
      notes          = (formData.get('notes')          as string) || '';
      photos = formData.getAll('photos') as File[];
    }

    if (!customerName || !customerEmail || !customerPhone || !customerAddress || !propertyDescription) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Save photos
    const uploadDir = join(process.cwd(), 'uploads', 'estimates');
    await mkdir(uploadDir, { recursive: true });
    const photoUrls: string[] = [];
    for (const photo of photos) {
      const filename = `${uuidv4()}-${photo.name}`;
      const filepath = join(process.cwd(), 'uploads', 'estimates', filename);
      const buffer = Buffer.from(await photo.arrayBuffer());
      await writeFile(filepath, buffer);
      photoUrls.push(`/api/uploads/estimates/${filename}`);
    }

    // Try AI generation first, fall back to rule-based
    const settings = readSettings();
    let estimateResult: { items: any[]; total: number } | null = null;

    if (settings.llmApiKey) {
      estimateResult = await tryAIEstimate(
        settings.llmApiKey,
        settings.llmModel,
        settings.llmTemperature,
        settings.llmMaxTokens,
        { customerName, propertyDescription, roomType, squareFootage: squareFootageRaw, notes }
      );
    }

    if (!estimateResult) {
      estimateResult = ruleBasedEstimate(roomType, squareFootageRaw);
    }

    const estimateId = generateEstimateId();
    const estimateNumber = `EST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const estimate = {
      id: estimateId,
      estimateNumber,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      propertyDescription,
      roomType,
      squareFootage: squareFootageRaw,
      notes,
      photos: photoUrls,
      status: 'draft',
      total: estimateResult.total,
      items: estimateResult.items,
      validUntil,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      generatedBy: settings.llmApiKey ? 'ai' : 'rule-based',
    };

    store[estimateId] = estimate;
    return NextResponse.json({ estimateId, estimate });
  } catch (error) {
    console.error('Error generating estimate:', error);
    return NextResponse.json({ error: 'Failed to generate estimate' }, { status: 500 });
  }
}

function generateEstimateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `EST-${timestamp}-${random}`;
}