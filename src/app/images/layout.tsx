import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "../globals.css";

// Configure the Arabic font
const cairo = Cairo({
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "فريق الجياد الإعلامي",
  description:
    "أداة لإضافة الإطارات والشعارات على الصور والفيديوهات الخاصة بالجمعية الكشفية بسهولة.",
  keywords: [
    "كشافة",
    "صور",
    "فيديو",
    "إطارات",
    "تجهيز وسائط",
    "scouts",
    "media",
  ],
  authors: [{ name: "فريق الجياد الإعلامي" }],
  themeColor: "#0f2a38", // Matches your main background color
  openGraph: {
    title: "أداة الوسائط الكشفية",
    description: "تجهيز وإضافة الإطارات للصور والفيديوهات الخاصة بالجمعية.",
    type: "website",
    locale: "ar_AR",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${cairo.className} bg-[#0f2a38] text-white antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
