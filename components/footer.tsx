import Link from "next/link";
import { Dumbbell } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-ink-200/40 dark:border-ink-800/60 mt-24">
      <div className="mx-auto max-w-7xl px-6 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <Link href="/" className="flex items-center gap-2 font-display font-bold">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 text-ink-950">
              <Dumbbell className="h-5 w-5" />
            </div>
            FitConnect
          </Link>
          <p className="mt-4 text-sm text-ink-400 max-w-xs">
            Train with the world's best specialists, in any sport, anywhere.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-ink-100">Product</h4>
          <ul className="space-y-2 text-sm text-ink-400">
            <li>
              <Link href="/discover">Find a trainer</Link>
            </li>
            <li>
              <Link href="/dashboard">Athlete dashboard</Link>
            </li>
            <li>
              <Link href="/trainer">For trainers</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-ink-100">Company</h4>
          <ul className="space-y-2 text-sm text-ink-400">
            <li>About</li>
            <li>Careers</li>
            <li>Press</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-ink-100">Legal</h4>
          <ul className="space-y-2 text-sm text-ink-400">
            <li>Privacy</li>
            <li>Terms</li>
            <li>Contact</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-200/40 dark:border-ink-800/60 py-6 text-center text-xs text-ink-500">
        © {new Date().getFullYear()} FitConnect · Built with care · Part of the Querinoz suite
      </div>
    </footer>
  );
}
