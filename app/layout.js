import Header from "@/components/Header";
import "./globals.css";
import {Inter} from 'next/font/google';
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({subsets:["latin"]})

export const metadata = {
  title: "WeLTh",
  description: "One stop Finance Platform",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={`${inter.className}`}
      >
        {/* Header */}
        <Header/>
        
        <main className="min-h-screen">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-blue-50 py-12"> 
          <div className="container mx-auto px-4 text-center text-gray-600 font-semibold">
            <p>Made with 💗 by Irshad</p>
          </div>
        </footer>
      </body>
    </html>
    </ClerkProvider>
  );
}
