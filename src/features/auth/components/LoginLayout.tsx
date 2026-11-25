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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <header className="mb-8 text-center">
          <div className="mb-5 flex justify-center">
            <img
              src={leadLogo}
              alt="LEAD Bangladesh"
              className="h-16 w-auto object-contain"
            />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>

          <p className="mt-2 text-sm text-slate-500">{description}</p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {children}
        </section>

        <footer className="mt-6 text-center text-xs text-slate-400">
          Attendance Management System
        </footer>
      </div>
    </main>
  );
}
