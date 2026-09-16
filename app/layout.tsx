import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CookieConsentBanner } from '@/components/pdpa/CookieConsent';
import { IdleTimeoutHandler } from '@/components/security/IdleTimeoutHandler';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tomvis Clinic - ระบบบริหารจัดการคลินิกเวชกรรม',
  description: 'ระบบสารสนเทศเพื่อการบริหารจัดการคลินิกเวชกรรม ประวัติการรักษาพยาบาล (EMR) และการคุ้มครองข้อมูล PDPA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <IdleTimeoutHandler />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CookieConsentBanner />
        </div>
      </body>
    </html>
  );
}
