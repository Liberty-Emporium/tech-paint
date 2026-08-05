import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { all, insert } from '@/lib/db';

interface Document {
  id: string;
  name: string;
  type: 'estimate' | 'contract' | 'signed_contract' | 'other';
  estimateId?: string;
  envelopeId?: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  status: 'draft' | 'sent' | 'signed' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const documents = await all<Document>('documents');
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const estimateId = formData.get('estimateId') as string;
    const envelopeId = formData.get('envelopeId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Save file
    const uploadDir = join(process.cwd(), 'uploads', 'documents');
    await mkdir(uploadDir, { recursive: true });

    const filename = `${type}_${uuidv4()}_${file.name}`;
    const filepath = join(uploadDir, filename);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    await writeFile(filepath, buffer);

    const document = await insert<Document>('documents', {
      name: name || file.name,
      type: (type as any) || 'other',
      estimateId: estimateId || undefined,
      envelopeId: envelopeId || undefined,
      filePath: `/uploads/documents/${filename}`,
      fileSize: file.size,
      mimeType: file.type,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Document);

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}
