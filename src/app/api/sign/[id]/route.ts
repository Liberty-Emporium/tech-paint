import { NextRequest, NextResponse } from 'next/server';
import { findById, update } from '@/lib/db';

// Self-hosted e-signature for estimates.
// Public (no auth): customers open the signing link, sign, and accept.
// The estimate id is a long random token (EST-<ts>-<rand>), which is the
// access control for a specific signing session.

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const est = await findById('estimates', params.id);
  if (!est) {
    return NextResponse.json({ error: 'Estimate not found' }, { status: 404 });
  }
  // Public read: strip nothing sensitive for the sign view (customer needs all of it).
  return NextResponse.json(est);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const est = await findById('estimates', params.id);
    if (!est) {
      return NextResponse.json({ error: 'Estimate not found' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { signerName, signatureImage } = body;

    if (!signerName || String(signerName).trim().length < 2) {
      return NextResponse.json({ error: 'Please enter your full name' }, { status: 400 });
    }
    if (!signatureImage || typeof signatureImage !== 'string') {
      return NextResponse.json({ error: 'Please provide your signature' }, { status: 400 });
    }

    const signedAt = new Date().toISOString();
    const updated = await update('estimates', params.id, {
      status: 'accepted',
      signature: {
        signerName: String(signerName).trim(),
        signatureImage,
        signedAt,
      },
      signedAt,
      updatedAt: signedAt,
    });

    return NextResponse.json({
      success: true,
      signedAt,
      estimate: updated,
    });
  } catch (error) {
    console.error('Sign estimate error:', error);
    return NextResponse.json({ error: 'Failed to sign estimate' }, { status: 500 });
  }
}
