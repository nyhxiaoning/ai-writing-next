// 这个文件只是为了兼容性，实际的布局在 [locale]/layout.tsx 中
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  );
}
