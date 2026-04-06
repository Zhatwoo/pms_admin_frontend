import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
        Pawnshop Management System
      </h1>
      <p className="mb-8 text-zinc-500 dark:text-zinc-400">
        Select your portal to continue
      </p>
      <div className="flex flex-col gap-3">
        <Link
          href="/superadmin/dashboard"
          className="rounded-lg border border-zinc-200 bg-white px-8 py-3 text-center font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
        >
          Superadmin Portal
        </Link>
        <Link
          href="/admin/dashboard"
          className="rounded-lg border border-zinc-200 bg-white px-8 py-3 text-center font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
        >
          Admin Portal
        </Link>
        <Link
          href="/branch/dashboard"
          className="rounded-lg border border-zinc-200 bg-white px-8 py-3 text-center font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
        >
          Branch Portal
        </Link>
      </div>
    </div>
  );
}
