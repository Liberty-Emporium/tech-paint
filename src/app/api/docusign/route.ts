import { NextRequest, NextResponse } from 'next/server';

declare global {
  // eslint-disable-next-line no-var
  var __estimates: Record<string, any> | undefined;
}
const store: Record<string, any> = global.__estimates || (global.__estimates = {});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'create_envelope': {
        // Create a DocuSign envelope for e-signature.
        // NOTE: This is a functional stub. To go fully live, wire DocuSign's
        // eSignature REST API here (create envelope -> recipient view URL).
        const { estimateId, customerEmail, customerName } = data;

        const envelopeId = `env_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Best-effort: mark the estimate as 'sent' so the UI updates.
        if (estimateId && store[estimateId]) {
          store[estimateId].status = 'sent';
          store[estimateId].envelopeId = envelopeId;
        }

        return NextResponse.json({
          envelopeId,
          status: 'created',
          uri: `/envelopes/${envelopeId}`,
          signUrl: `/estimates/${estimateId}`,
          recipient: { email: customerEmail, name: customerName },
          statusDateTime: new Date().toISOString(),
        });
      }

      case 'send_envelope': {
        const { envelopeId } = data;
        return NextResponse.json({
          success: true,
          envelopeId,
          status: 'sent',
          sentDateTime: new Date().toISOString(),
        });
      }

      case 'get_envelope_status': {
        const { envelopeId } = data;
        return NextResponse.json({
          envelopeId,
          status: 'sent',
          statusDateTime: new Date().toISOString(),
          recipients: [
            {
              email: 'client@example.com',
              name: 'John Client',
              status: 'sent',
              deliveredDateTime: new Date().toISOString(),
            },
          ],
        });
      }

      case 'get_signed_document': {
        const { envelopeId } = data;
        return NextResponse.json({
          envelopeId,
          status: 'completed',
          completedDateTime: new Date().toISOString(),
          documents: [
            {
              documentId: '1',
              name: 'Painting Estimate Contract',
              uri: `/envelopes/${envelopeId}/documents/1`,
            },
          ],
        });
      }

      case 'webhook': {
        const event = data;
        console.log('DocuSign webhook received:', event);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('DocuSign API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
