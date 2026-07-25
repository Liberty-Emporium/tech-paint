import { NextRequest, NextResponse } from 'next/server';
import { createReadStream, existsSync, statSync } from 'fs';
import { join } from 'path';

// Serve uploaded files (estimate photos, documents) from /uploads.
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const rel = params.path.join('/');
    // Prevent path traversal.
    const safe = rel.replace(/\.\.+/g, '');
    const filepath = join(process.cwd(), 'uploads', safe);
    if (!existsSync(filepath) || !statSync(filepath).isFile()) {
      return new NextResponse('Not found', { status: 404 });
    }
    const ext = filepath.split('.').pop()?.toLowerCase();
    const types: Record<string, string> = {
      pdf: 'application/pdf',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    const contentType = types[ext || ''] || 'application/octet-stream';
    const stream = createReadStream(filepath);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(chunk as Buffer);
    return new NextResponse(Buffer.concat(chunks), {
      status: 200,
      headers: { 'Content-Type': contentType },
    });
  } catch (error) {
    console.error('Uploads GET error:', error);
    return new NextResponse('Error', { status: 500 });
  }
}
