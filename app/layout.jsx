import './globals.css';

export const metadata = {
  title: 'U9I',
  description: 'Key System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-luxury-bg text-white">{children}</body>
    </html>
  );
}
