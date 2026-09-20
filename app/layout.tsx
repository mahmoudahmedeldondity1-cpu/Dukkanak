import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import { getServerSession } from "next-auth";
import { authOptions, isAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "دُكَّانَكْ | متجرك الإلكتروني المصري",
  description: "دُكَّانَكْ — تسوق منتجات أصلية بأسعار مناسبة مع شحن لكل محافظات مصر والدفع عند الاستلام.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let maintenanceOn = false;
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "maintenance_mode" } });
    maintenanceOn = setting?.value === "true";
  } catch {
    // في حال عدم توفر قاعدة البيانات بعد (أول تشغيل قبل db:push)، تجاهل الفحص
  }

  const session = await getServerSession(authOptions);
  const isAdmin = isAdminRole((session?.user as any)?.role);

  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="font-sans min-h-screen flex flex-col">
        <Providers>
          {maintenanceOn && !isAdmin ? (
            <main className="flex-1 flex items-center justify-center px-4 text-center">
              <div>
                <h1 className="text-2xl font-bold mb-2">المتجر تحت الصيانة حاليًا</h1>
                <p className="text-gray-500">هنرجع قريبًا، شكرًا لصبرك.</p>
              </div>
            </main>
          ) : (
            <>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </>
          )}
        </Providers>
      </body>
    </html>
  );
}
