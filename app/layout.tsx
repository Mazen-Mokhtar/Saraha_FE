import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Saraha App - Login',
  description: 'Login to Saraha App to send and receive anonymous messages',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link 
          rel="stylesheet" 
          href="https://use.fontawesome.com/releases/v5.2.0/css/all.css" 
          crossOrigin="anonymous"
        />
        <link 
          rel="stylesheet" 
          href="https://use.fontawesome.com/releases/v5.2.0/css/fontawesome.css" 
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}