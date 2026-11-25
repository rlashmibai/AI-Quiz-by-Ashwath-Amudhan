import type { Metadata } from 'next';
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-bricolage',
  display: 'swap',
});

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
    <html lang="en" className={`${plusJakarta.variable} ${bricolage.variable}`}>
      <body className="min-h-screen bg-[#f8fafc] text-[#0f2942] antialiased selection:bg-teal-100 selection:text-[#0f2942]">
        {children}
      </body>
    </html>
  );
}
