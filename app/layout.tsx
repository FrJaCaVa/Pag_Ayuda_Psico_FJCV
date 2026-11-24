import type { Metadata } from 'next';
import { AppProvider } from '@/context/AppContext';
import Navbar from "@/components/Navbar";
import AyudaInmediataModal from '@/components/AyudaInmediataModal';
import './globals.css';

export const metadata: Metadata = {
  title: 'Calma | Acompañamiento Psicológico Online',
  description: 'Un espacio seguro, cercano y profesional para cuidar tu bienestar emocional.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#F6FFF8] text-[#2F3E3B] antialiased selection:bg-[#A4C3B2]/40 flex flex-col justify-between">
        <AppProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <AyudaInmediataModal />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}