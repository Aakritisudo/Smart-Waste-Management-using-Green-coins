import './globals.css';
import Scene3D from '@/components/Scene3D';

export const metadata = { title: 'Green Coins', description: 'Sort your waste. Earn Green Coins.' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Scene3D />
        <div className="app">{children}</div>
      </body>
    </html>
  );
}
