// src/app/layout.tsx
import './globals.css';
import { FamilyProvider } from '../context/FamilyContext';
import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Arbre Généalogique',
  description: 'Application d\'arbre généalogique interactive',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <FamilyProvider>
          <div className="min-h-screen flex flex-col">
            <header className="bg-white shadow-sm">
              <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                  <Link href="/" className="font-bold text-2xl text-blue-600">
                    ArbreGénéa
                  </Link>
                  
                  <nav>
                    <ul className="flex space-x-6">
                      <li>
                        <Link href="/" className="hover:text-blue-600 transition">
                          Accueil
                        </Link>
                      </li>
                      <li>
                        <Link href="/family" className="hover:text-blue-600 transition">
                            Familles
                        </Link>
                        </li>
                      <li>
                        <Link href="/tree" className="hover:text-blue-600 transition">
                          Arbre
                        </Link>
                      </li>
                      <li>
                        <Link href="/person" className="hover:text-blue-600 transition">
                          Personnes
                        </Link>
                      </li>
                      <li>
                        <Link href="/search" className="hover:text-blue-600 transition">
                          Recherche
                        </Link>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </header>
            
            <main className="flex-grow">
              {children}
            </main>
            
            <footer className="bg-gray-100 border-t">
              <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <p className="text-gray-600 mb-4 md:mb-0">
                    © {new Date().getFullYear()} ArbreGénéa - Application darbre généalogique
                  </p>
                  
                  <div className="flex space-x-4">
                    <Link href="/about" className="text-gray-600 hover:text-blue-600 transition">
                      À propos
                    </Link>
                    <Link href="/help" className="text-gray-600 hover:text-blue-600 transition">
                      Aide
                    </Link>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </FamilyProvider>
      </body>
    </html>
  );
}