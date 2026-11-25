import type { ReactNode } from "react";
import { LuLockKeyhole } from "react-icons/lu";

interface LoginLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export default function LoginLayout({
  title,
  description,
  children,
}: LoginLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <LuLockKeyhole size={26} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>

          <p className="mt-2 text-sm text-slate-500">{description}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {children}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Attendance Management System
        </p>
      </div>
    </main>
  );
}
