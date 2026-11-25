import type { ReactNode } from "react";
import leadLogo from "../../../assets/leadLogo.webp";

interface LoginLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function LoginLayout({
  title,
  description,
  children,
}: LoginLayoutProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-12">
      {/* Subtle background accents */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#F40026]/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[#F40026]/5 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <header className="mb-8 text-center">
          <div className="mb-8 flex justify-center">
            <img
              src={leadLogo}
              alt="LEAD Bangladesh"
              className="h-16 w-auto object-contain"
            />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#030708]">
            {title}
          </h1>

          <p className="mt-3 text-sm text-[#030708]/60">{description}</p>
        </header>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl shadow-[#030708]/5 sm:p-8">
          {children}
        </section>

        <footer className="mt-7 text-center">
          <p className="text-xs text-[#030708]/40">
            © {new Date().getFullYear()} LEAD Bangladesh
          </p>
          <p className="mt-1 text-xs text-[#030708]/40">
            Attendance Management System
          </p>
        </footer>
      </div>
    </main>
  );
}
