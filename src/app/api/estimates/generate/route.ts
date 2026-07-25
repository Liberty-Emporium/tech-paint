import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const customerName = formData.get('customerName') as string;
    const customerEmail = formData.get('customerEmail') as string;
    const customerPhone = formData.get('customerPhone') as string;
    const customerAddress = formData.get('customerAddress') as string;
    const propertyDescription = formData.get('propertyDescription') as string;
    const roomType = formData.get('roomType') as string;
    const squareFootage = formData.get('squareFootage') as string;
    const notes = formData.get('notes') as string;
    
    // Get photos
    const photos = formData.getAll('photos') as File[];
    
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
      photoUrls.push(`/uploads/estimates/${filename}`);
    }

    // Generate estimate ID
    const estimateId = generateEstimateId();
    
    // Here you would call your AI service to generate the estimate
    // For now, we'll create a mock estimate
    const estimate = {
      id: generateEstimateId(),
      customerName: formData.get('customerName'),
      customerEmail: formData.get('customerEmail'),
      customerPhone: formData.get('customerPhone'),
      customerAddress: formData.get('customerAddress'),
      propertyDescription: formData.get('propertyDescription'),
      roomType: formData.get('roomType'),
      squareFootage: formData.get('squareFootage'),
      notes: formData.get('notes'),
      photos: photoUrls,
      status: 'draft',
      createdAt: new Date().toISOString(),
      total: 0, // Will be calculated by AI
    };

    // Save estimate to database (in a real app, you'd save to a database)
    // For now, we'll just return the estimate ID
    
    return NextResponse.json({ estimateId: estimate.id });
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