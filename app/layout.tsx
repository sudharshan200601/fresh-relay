import type { Metadata } from 'next';
import './globals.css';
import { RoleProvider } from '@/context/RoleContext';
import { Navbar } from '@/components/Navbar';
import { MobileNav } from '@/components/MobileNav';

export const metadata: Metadata = {
  title: 'Fresh Relay | Food Donation Logistics & Rescue Network',
  description: 'Connecting food receivers with donors and NGOs to rescue surplus food before it expires.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F8F9FA] text-[#2C3E50] min-h-screen flex flex-col pb-20 md:pb-8">
        <RoleProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <MobileNav />
        </RoleProvider>
      </body>
    </html>
  );
}
