import type { Metadata = next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TechPaint',
  description: 'Painting contractor estimate tool',
};

export default function RootLayout(; children: { children: React.React.Node }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}