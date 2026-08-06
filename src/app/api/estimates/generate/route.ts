import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { readFileSync, existsSync } from 'fs';
import { upsert } from '@/lib/db';
import { requireAuth } from '@/lib/require-auth';
import { SETTINGS_FILE } from '@/lib/config';

function readSettings() {
  try {
    if (existsSync(SETTINGS_FILE)) return JSON.parse(readFileSync(SETTINGS_FILE, 'utf-8'));
  } catch {}
  return {};
}

// Convert a File to a base64 data URL for the vision API.
async function fileToBase64Url(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const type = file.type || 'image/jpeg';
  return `data:${type};base64,${buffer.toString('base64')}`;
}

// Try AI estimate via OpenRouter with optional photo analysis.
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
  },
  photoDataUrls: string[] // base64 data URLs
): Promise<{ items: Array<{ id: string; description: string; quantity: number; unitPrice: number; total: number }>; total: number } | null> {
  try {
    const textPrompt = `You are a professional painting contractor estimating tool. Generate a detailed painting estimate.

Customer: ${info.customerName}
Project: ${info.propertyDescription}
Room/Area type: ${info.roomType || 'interior'}
Square footage: ${info.squareFootage || 'unknown'} sq ft
Notes: ${info.notes || 'none'}
${photoDataUrls.length > 0 ? `\nI've included ${photoDataUrls.length} photo(s) of the space. Analyze the walls, surfaces, trim, ceilings, and any prep work needed. Factor in:\n- Surface condition (holes, cracks, peeling paint, stains)\n- Number of coats needed\n- Trim complexity\n- Ceiling height\n- Any special surfaces (textured, wallpaper removal, etc.)` : '\n(No photos provided — estimate based on description only.)'}

Respond with ONLY valid JSON, no markdown fences:
{
  "items": [
    {"description": "line item description", "quantity": 500, "unitPrice": 2.50, "total": 1250.00}
  ],
  "total": 1250.00
}

Include realistic line items for paint, labor, prep work, materials, etc. Use current US market rates for professional painting.`;

    // Build message content: text + optional images
    const content: any[] = [{ type: 'text', text: textPrompt }];
    for (const url of photoDataUrls) {
      content.push({ type: 'image_url', image_url: { url } });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://techpaint.jays-web.org',
        'X-Title': 'Coltrane Tech Paint',
      },
      body: JSON.stringify({
        model: model || 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a painting estimate generator. Respond with ONLY valid JSON, no markdown, no explanation.' },
          { role: 'user', content },
        ],
        temperature: temperature ?? 0.7,
        max_tokens: maxTokens ?? 4000,
      }),
      // Allow enough time for the (sometimes slow) free model to finish,
      // but fail fast enough that a hung model doesn't block the whole estimate.
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenRouter error:', response.status, errText.substring(0, 500));
      return null;
    }

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

function ruleBasedEstimate(roomType: string, squareFootageRaw: string) {
  // Real-world estimator that ALWAYS produces a sensible, itemized price.
  // If square footage is missing, use a reasonable per-room default so the
  // estimate is never $0.
  const rawSqft = parseInt(squareFootageRaw || '0', 10) || 0;
  const squareFootage = rawSqft > 0 ? rawSqft : 300; // default ~ a typical room

  const rateByRoom: Record<string, number> = {
    interior: 2.5, exterior: 3.5, cabinet: 6.0,
    deck: 4.0, ceiling: 3.0, trim: 1.5,
  };
  const rate = rateByRoom[roomType?.toLowerCase()] || 3.0;
  const paintCost = squareFootage * rate;
  const prepCost = Math.round(squareFootage * 0.8 * 100) / 100;  // sanding, caulk, patching
  const primerCost = Math.round(squareFootage * 0.5 * 100) / 100; // primer coat
  const laborCost = Math.round(paintCost * 0.6 * 100) / 100;
  const subtotal = Math.round((paintCost + prepCost + primerCost + laborCost) * 100) / 100;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;
  const label = roomType ? roomType.charAt(0).toUpperCase() + roomType.slice(1) : 'Interior';

  const items = [
    { id: uuidv4(), description: `${label} paint & materials (${squareFootage} sq ft @ $${rate.toFixed(2)}/sq ft)`, quantity: 1, unitPrice: Math.round(paintCost * 100) / 100, total: Math.round(paintCost * 100) / 100 },
    { id: uuidv4(), description: 'Surface prep (sanding, patching, caulk)', quantity: 1, unitPrice: prepCost, total: prepCost },
    { id: uuidv4(), description: 'Primer coat', quantity: 1, unitPrice: primerCost, total: primerCost },
    { id: uuidv4(), description: 'Labor', quantity: 1, unitPrice: laborCost, total: laborCost },
  ];

  return { items, totals: { subtotal, tax, total }, total };
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
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

    if (!propertyDescription) {
      return NextResponse.json({ error: 'Please describe the work that needs to be done.' }, { status: 400 });
    }
    if (!customerEmail || !customerName) {
      return NextResponse.json({ error: 'Your sign-in profile is missing an email or name. Please update your profile in Settings.' }, { status: 400 });
    }
    // Fall backs so estimates always generate even if optional fields are blank.
    customerName = customerName || 'Coltrane Customer';
    customerPhone = customerPhone || '';
    customerAddress = customerAddress || '';

    // Save photos to disk AND convert to base64 for AI
    const uploadDir = join(process.cwd(), 'uploads', 'estimates');
    await mkdir(uploadDir, { recursive: true });
    const photoUrls: string[] = [];
    const photoDataUrls: string[] = [];

    for (const photo of photos) {
      const filename = `${uuidv4()}-${photo.name}`;
      const filepath = join(process.cwd(), 'uploads', 'estimates', filename);
      const buffer = Buffer.from(await photo.arrayBuffer());
      await writeFile(filepath, buffer);
      photoUrls.push(`/api/uploads/estimates/${filename}`);
      // Convert to base64 data URL for vision model
      const type = photo.type || 'image/jpeg';
      photoDataUrls.push(`data:${type};base64,${buffer.toString('base64')}`);
    }

    // Try AI generation (with photos if available), fall back to rule-based
    const settings = readSettings();
    let estimateResult: { items: any[]; total: number } | null = null;

    if (settings.llmApiKey) {
      // Try the configured model first, then a small set of reliable alternates
      // so a rate-limited/busy free model doesn't drop us to the rule-based calc.
      const fallbackModels = settings.llmModel
        ? [String(settings.llmModel), 'openai/gpt-4o-mini', 'google/gemini-2.5-flash-lite']
        : ['openai/gpt-4o-mini', 'google/gemini-2.5-flash-lite', 'google/gemma-4-26b-a4b-it:free'];

      const seen = new Set<string>();
      for (const m of fallbackModels) {
        if (seen.has(m)) continue;
        seen.add(m);
        estimateResult = await tryAIEstimate(
          settings.llmApiKey,
          m,
          settings.llmTemperature,
          settings.llmMaxTokens,
          { customerName, propertyDescription, roomType, squareFootage: squareFootageRaw, notes },
          photoDataUrls
        );
        if (estimateResult) break;
      }
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
      generatedBy: settings.llmApiKey ? (photoDataUrls.length > 0 ? 'ai-vision' : 'ai-text') : 'rule-based',
    };

    await upsert('estimates', estimate);
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