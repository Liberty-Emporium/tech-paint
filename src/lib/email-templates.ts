export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
}

export interface DocuSignEnvelope {
  envelopeId: string;
  status: 'created' | 'sent' | 'delivered' | 'signed' | 'completed' | 'declined' | 'voided';
  documents: Document[];
  recipients: Recipient[];
  statusDateTime: string;
}

export interface Document {
  documentId: string;
  name: string;
  uri: string;
}

export interface Recipient {
  email: string;
  name: string;
  role: 'signer' | 'cc' | 'approver';
  routingOrder: number;
  status?: 'created' | 'sent' | 'delivered' | 'signed' | 'completed' | 'declined';
}

export interface EstimateEmailData {
  customerName: string;
  customerEmail: string;
  estimateId: string;
  estimateTotal: number;
  estimateNumber: string;
  estimateDate: string;
  estimateItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  totalAmount: number;
  validUntil: string;
  companyName: string;
  companyPhone: string;
  companyEmail: string;
  companyAddress: string;
}

// Email templates
export const emailTemplates: Record<string, {
  subject: string;
  htmlContent: (data: any) => string;
  textContent: (data: any) => string;
  variables: string[];
}> = {
  estimate_sent: {
    subject: 'Your Painting Estimate from {{companyName}} - Estimate #{{estimateNumber}}',
    htmlContent: (data: EstimateEmailData) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Your Painting Estimate is Ready</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">From {{companyName}}</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
            Hi {{customerName}},<br><br>
            Thank you for requesting an estimate from <strong>{{companyName}}</strong>. We've prepared a detailed painting estimate for your project.
          </p>

          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px; color: #1f2937; font-size: 18px;">Estimate Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Estimate #</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">{{estimateNumber}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Date</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">{{estimateDate}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Valid Until</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">{{validUntil}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Total Amount</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 20px; font-weight: bold; color: #2563eb;">\${{estimateTotal}}</td>
              </tr>
            </table>
          </div>

          <h3 style="margin: 0 0 16px; color: #1f2937; font-size: 18px;">Estimate Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                <th style="padding: 12px; text-align: left; font-weight: 600;">Item</th>
                <th style="padding: 12px; text-align: center; font-weight: 600;">Qty</th>
                <th style="padding: 12px; text-align: right; font-weight: 600;">Unit Price</th>
                <th style="padding: 12px; text-align: right; font-weight: 600;">Total</th>
              </thead>
              <tbody>
                {{#each estimateItems}}
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px;">{{description}}</td>
                  <td style="padding: 12px; text-align: center;">{{quantity}}</td>
                  <td style="padding: 12px; text-align: right;">\${{unitPrice}}</td>
                  <td style="padding: 12px; text-align: right; font-weight: 600;">\${{total}}</td>
                </tr>
                {{/each}}
              </tbody>
              <tfoot>
                <tr style="background: #f3f4f6; font-weight: bold; border-top: 2px solid #e5e7eb;">
                  <td colspan="3" style="padding: 12px; text-align: right;">Total</td>
                  <td style="padding: 12px; text-align: right; font-size: 18px;">\${{totalAmount}}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin-bottom: 16px;">
              This estimate is valid until <strong>{{validUntil}}</strong>. 
              Prices are subject to change based on material availability.
            </p>
            
            <p style="color: #6b7280; font-size: 14px;">
              <strong>{{companyName}}</strong><br>
              {{companyAddress}}<br>
              {{companyPhone}} | {{companyEmail}}
            </p>
          </div>

          <div style="text-align: center; margin-top: 32px;">
            <a href="{{signUrl}}" style="display: inline-block; background: #2563eb; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Review & Sign Estimate
            </a>
          </div>
        </div>
        
        <div style="text-align: center; padding: 24px; color: #9ca3af; font-size: 14px;">
          <p>{{companyName}} • {{companyPhone}} • {{companyEmail}}</p>
          <p style="margin-top: 8px;">This estimate was generated by TechPaint AI</p>
        </div>
      </div>
    </body>
    </html>
  `,
    textContent: (data: EstimateEmailData) => `
Your Painting Estimate is Ready!

Hi {{customerName}},

Thank you for requesting an estimate from {{companyName}}. We've prepared a detailed painting estimate for your project.

Estimate #{{estimateNumber}}
Date: {{estimateDate}}
Valid Until: {{validUntil}}
Total Amount: \${{estimateTotal}}

Estimate Details:
{{#each estimateItems}}
- {{description}} (Qty: {{quantity}}) - \${{unitPrice}} each = \${{total}}
{{/each}}

Total: \${{totalAmount}}

This estimate is valid until {{validUntil}}.

To review and sign your estimate, visit: {{signUrl}}

---
{{companyName}}
{{companyAddress}}
{{companyPhone}} | {{companyEmail}}

This estimate was generated by TechPaint AI
    `,
    variables: ['customerName', 'customerEmail', 'estimateId', 'estimateTotal', 'estimateNumber', 'estimateDate', 'estimateItems', 'totalAmount', 'validUntil', 'companyName', 'companyPhone', 'companyEmail', 'companyAddress', 'signUrl']
  },

  estimate_accepted: {
    subject: 'Estimate Accepted - {{estimateNumber}} from {{companyName}}',
    htmlContent: (data: EstimateEmailData) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Estimate Accepted!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Your client has accepted the estimate</p>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
          <h2 style="margin: 0 0 16px; color: #1f2937;">Estimate {{estimateNumber}} Accepted</p>
          <p style="color: #6b7280;">Your client <strong>{{customerName}}</strong> has accepted estimate <strong>#{{estimateNumber}}</strong> for <strong>\${{estimateTotal}}</strong>.</p>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; color: #065f46;"><strong>Next Steps:</strong> The signed document has been sent to both parties. You can now schedule the work and order materials.</p>
          </div>
          <p style="color: #6b7280; margin-top: 24px;">View the signed document in your <a href="{{dashboardUrl}}" style="color: #2563eb;">dashboard</a>.</p>
        </div>
      </body>
      </html>
    `,
    textContent: (data: EstimateEmailData) => `
      Estimate Accepted!
      
      Your client {{customerName}} has accepted estimate #{{estimateNumber}} for \${{estimateTotal}}.
      
      View the signed document in your dashboard: {{dashboardUrl}}
    `,
    variables: ['customerName', 'estimateNumber', 'estimateTotal', 'dashboardUrl']
  },

  estimate_declined: {
    subject: 'Estimate Declined - {{estimateNumber}} from {{companyName}}',
    htmlContent: (data: EstimateEmailData) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Estimate Declined</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Your client has declined the estimate</p>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
          <h2 style="margin: 0 0 16px; color: #1f2937;">Estimate {{estimateNumber}} Declined</p>
          <p style="color: #6b7280;">Your client <strong>{{customerName}}</strong> has declined estimate <strong>#{{estimateNumber}}</strong> for <strong>\${{estimateTotal}}</strong>.</p>
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; color: #991b1b;"><strong>Next Steps:</strong> Consider reaching out to the client to discuss their concerns or revise the estimate.</p>
          </div>
          <p style="color: #6b7280; margin-top: 24px;">View details in your <a href="{{dashboardUrl}}" style="color: #2563eb;">dashboard</a>.</p>
        </div>
      </body>
      </html>
    `,
    textContent: (data: EstimateEmailData) => `
      Estimate Declined
      
      Your client {{customerName}} has declined estimate #{{estimateNumber}} for \${{estimateTotal}}.
      
      View details in your dashboard: {{dashboardUrl}}
    `,
    variables: ['customerName', 'estimateNumber', 'estimateTotal', 'dashboardUrl']
  },

  estimate_signed: {
    subject: 'Estimate Signed - {{estimateNumber}} from {{companyName}}',
    htmlContent: (data: EstimateEmailData) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✍️ Document Signed!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Your estimate has been signed via DocuSign</p>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
          <h2 style="margin: 0 0 16px; color: #1f2937;">Estimate {{estimateNumber}} Signed</p>
          <p style="color: #6b7280;">The document has been <strong>signed and completed</strong> by all parties.</p>
          <div style="background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; color: #4c1d95;"><strong>Next Steps:</strong> The fully executed contract is now available. You can download it from your dashboard and begin scheduling the project.</p>
          </div>
          <div style="text-align: center; margin-top: 24px;">
            <a href="{{dashboardUrl}}/documents/{{estimateId}}" style="display: inline-block; background: #8b5cf6; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Download Signed Contract
            </a>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: (data: EstimateEmailData) => `
      Document Signed!
      
      The document has been signed and completed by all parties.
      
      Download the signed contract: {{dashboardUrl}}/documents/{{estimateId}}
    `,
    variables: ['estimateNumber', 'estimateId', 'dashboardUrl']
  },

  test_email: {
    subject: 'TechPaint - Test Email',
    htmlContent: (data: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Test Email</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
            This is a test email from TechPaint. If you received this, your SMTP configuration is working correctly!
          </p>
        </div>
      </body>
      </html>
    `,
    textContent: (data: any) => `
      Test Email
      
      This is a test email from TechPaint. If you received this, your SMTP configuration is working correctly!
    `,
    variables: []
  }
};

// Helper function to render template with variables
export function renderTemplate(template: string, data: Record<string, any>): string {
  let rendered = template;
  
  // Simple variable replacement {{variable}}
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    rendered = rendered.replace(regex, String(value));
  });
  
  // Handle array iteration {{#each array}}...{{/each}}
  const eachRegex = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
  rendered = rendered.replace(eachRegex, (match, arrayName, content) => {
    const array = data[arrayName];
    if (!Array.isArray(array)) return '';
    return array.map(item => {
      let itemContent = content;
      Object.entries(item).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        itemContent = itemContent.replace(regex, String(value));
      });
      return itemContent;
    }).join('');
  });
  
  return rendered;
}

// Get template by name
export function getEmailTemplate(name: string) {
  return emailTemplates[name];
}

// Get all template names
export function getEmailTemplateNames(): string[] {
  return Object.keys(emailTemplates);
}