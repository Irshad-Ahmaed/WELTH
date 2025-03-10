import "./globals.css";
import {Inter} from 'next/font/google';

const inter = Inter({subsets:["latin"]})

export const metadata = {
  title: "WeLTh",
  description: "One stop Finance Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className}`}
      >
        {/* Header */}
        
        {children}

        {/* Footer */}
      </body>
    </html>
  );
}
