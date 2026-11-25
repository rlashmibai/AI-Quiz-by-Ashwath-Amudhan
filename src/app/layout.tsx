import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Artificial Intelligence Quiz — Tricky Toddlers',
  description:
    'Artificial Intelligence Quiz by Tricky Toddlers for parents, teachers, and students at the school innovation exhibition.',
  openGraph: {
    title: 'Artificial Intelligence Quiz — Tricky Toddlers',
    description:
      'Artificial Intelligence Quiz by Tricky Toddlers for parents, teachers, and students at the school innovation exhibition.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Artificial Intelligence Quiz — Tricky Toddlers',
    description:
      'Artificial Intelligence Quiz by Tricky Toddlers for parents, teachers, and students at the school innovation exhibition.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#f8fafc] text-[#0f2942] antialiased selection:bg-teal-100 selection:text-[#0f2942]">
        {children}
      </body>
    </html>
  );
}
