import { Inter } from 'next/font/google';
import { ContractProvider } from '@/context/ContractContext';
import Navigation from '@/components/Navigation';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0A0A0A] text-gray-200`}>
        <ContractProvider>
          <div className="min-h-screen">
            <Navigation />
            <main className="container mx-auto px-4 py-8">
              <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Splitwise Expense Tracker</h1>
              {children}
            </main>
          </div>
        </ContractProvider>
      </body>
    </html>
  );
}