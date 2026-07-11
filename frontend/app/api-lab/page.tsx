import Link from "next/link";
import { ArrowLeft, Braces } from "lucide-react";

import { ApiPlayground } from "@/app/components/ApiPlayground";

export const metadata = {
  title: "API Lab | Aruu Backend Systems",
  description: "Interactive API lab for the Go backend powering aruu.app.",
};

export default function ApiLabPage() {
  return (
    <main className="min-h-[100dvh] bg-[#080a0d] px-4 py-6 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/"
              className="mb-5 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-emerald-100"
            >
              <ArrowLeft size={16} strokeWidth={1.8} />
              Back to portfolio
            </Link>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-300/15 bg-emerald-300/10 text-emerald-200">
                <Braces size={22} strokeWidth={1.7} />
              </span>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
                  API Lab
                </h1>
                <p className="mt-1 text-sm text-zinc-500">
                  Live requests against the Go backend contract.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 px-4 py-3 font-mono text-xs text-emerald-100">
            /api/v1
          </div>
        </header>

        <ApiPlayground />
      </div>
    </main>
  );
}
