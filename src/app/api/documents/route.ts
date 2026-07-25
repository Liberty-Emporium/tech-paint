import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

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
    // In a real app, fetch from database
    const documents: Document[] = [
      {
        id: 'doc_1',
        name: 'Painting Estimate - Exterior House',
        type: 'estimate',
        estimateId: 'EST-abc123',
        filePath: '/uploads/documents/est_EST-abc123.pdf',
        fileSize: 245678,
        mimeType: 'application/pdf',
        status: 'completed',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T14:20:00Z'
      },
      {
        id: 'doc_2',
        name: 'Painting Contract - Rodriguez Co',
        type: 'contract',
        estimateId: 'EST-abc123',
        envelopeId: 'env_xyz789',
        filePath: '/uploads/documents/contract_EST-abc123.pdf',
        fileSize: 567890,
        mimeType: 'application/pdf',
        status: 'signed',
        createdAt: '2024-01-15T14:25:00Z',
        updatedAt: '2024-01-16T09:15:00Z'
      }
    ];

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

    const document: Document = {
      id: `doc_${uuidv4()}`,
      name,
      type: type as any,
      estimateId,
      envelopeId,
      filePath: `/uploads/documents/${filename}`,
      fileSize: file.size,
      mimeType: file.type,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}