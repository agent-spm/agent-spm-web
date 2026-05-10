import { Navbar } from "@/components/layout/Navbar";
import { PublicFooter } from "@/components/layout/public-footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12">
        <Navbar />
      </div>
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
