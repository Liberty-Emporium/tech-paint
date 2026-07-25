import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

declare global {
  // eslint-disable-next-line no-var
  var __estimates: Record<string, any> | undefined;
}
const store: Record<string, any> = global.__estimates || (global.__estimates = {});

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

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !customerAddress || !propertyDescription) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
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

    // ---- AI estimate generation (rule-based stand-in) ----
    const squareFootage = parseInt(squareFootageRaw || '0', 10) || 0;
    // Base rate per sq ft for interior painting, adjusted by room type.
    const rateByRoom: Record<string, number> = {
      interior: 2.5,
      exterior: 3.5,
      cabinet: 6.0,
      deck: 4.0,
      ceiling: 3.0,
      trim: 1.5,
    };
    const rate = rateByRoom[roomType?.toLowerCase()] || 3.0;
    const paintCost = squareFootage * rate;
    const laborCost = paintCost * 0.6;
    const subtotal = paintCost + laborCost;
    const tax = subtotal * 0.08;
    const total = Math.round((subtotal + tax) * 100) / 100;

    const items = [
      {
        id: uuidv4(),
        description: `${roomType ? roomType.charAt(0).toUpperCase() + roomType.slice(1) : 'Interior'} painting (${squareFootage} sq ft @ $${rate}/sq ft)`,
        quantity: squareFootage || 1,
        unitPrice: rate,
        total: Math.round(paintCost * 100) / 100,
      },
      {
        id: uuidv4(),
        description: 'Labor',
        quantity: 1,
        unitPrice: Math.round(laborCost * 100) / 100,
        total: Math.round(laborCost * 100) / 100,
      },
    ];

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
      total,
      items,
      validUntil,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Persist to in-memory store so detail/email/status endpoints can read it.
    store[estimateId] = estimate;

    return NextResponse.json({ estimateId, estimate });
  } catch (error) {
    console.error('Error generating estimate:', error);
    return NextResponse.json(
      { error: 'Failed to generate estimate' },
      { status: 500 }
    );
  }
}

function generateEstimateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `EST-${timestamp}-${random}`;
}
