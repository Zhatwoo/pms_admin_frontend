export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900">Settings</h1>
        <p className="mt-1 text-xs text-zinc-500">
          Configure pawnshop policies and system preferences.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="space-y-4">
          <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 px-4 py-3">
              <h2 className="text-xs font-bold text-zinc-800">Shop Information</h2>
            </div>

            <div className="space-y-3 px-4 py-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wide text-zinc-500">
                  Shop Name
                </label>
                <input
                  defaultValue="JCLB BUY BACK SHOP"
                  className="h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-800 outline-none transition-colors focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wide text-zinc-500">
                  Shop Address
                </label>
                <input
                  defaultValue="123 Main Street, Manila, Philippines"
                  className="h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-800 outline-none transition-colors focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wide text-zinc-500">
                    Phone Number
                  </label>
                  <input
                    defaultValue="+63 2 1234 5678"
                    className="h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-800 outline-none transition-colors focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wide text-zinc-500">
                    Email
                  </label>
                  <input
                    defaultValue="info@jclbbuyback.com"
                    className="h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-800 outline-none transition-colors focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 px-4 py-3">
              <h2 className="text-xs font-bold text-zinc-800">Pawnshop Policies</h2>
            </div>

            <div className="grid gap-3 px-4 py-4 md:grid-cols-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wide text-zinc-500">
                  Default Interest Rate (%)
                </label>
                <input
                  defaultValue="3.5"
                  className="h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-800 outline-none transition-colors focus:border-emerald-500 focus:bg-white"
                />
                <p className="text-[9px] text-zinc-400">per month</p>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wide text-zinc-500">
                  Default Pawn Duration (Days)
                </label>
                <input
                  defaultValue="30"
                  className="h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-800 outline-none transition-colors focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wide text-zinc-500">
                  Grace Period (Days)
                </label>
                <input
                  defaultValue="3"
                  className="h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-800 outline-none transition-colors focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </div>
          </section>

          <div className="flex gap-3">
            <button className="rounded-lg bg-emerald-700 px-5 py-2 text-[11px] font-bold text-white transition-colors hover:bg-emerald-800">
              Save Changes
            </button>
            <button className="rounded-lg border border-zinc-300 bg-white px-5 py-2 text-[11px] font-bold text-zinc-600 transition-colors hover:bg-zinc-50">
              Discard
            </button>
          </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-zinc-200 bg-white p-4 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-4 border-emerald-50 bg-emerald-800 text-2xl font-bold text-white">
              AD
            </div>
            <h3 className="text-sm font-bold text-zinc-900">Admin Panel</h3>
            <p className="mt-1 text-[10px] text-zinc-500">Super Admin Settings</p>
            <button className="mt-3 w-full rounded-lg border border-emerald-100 bg-emerald-50 py-2 text-[9px] font-bold uppercase tracking-wider text-emerald-700 transition-colors hover:bg-emerald-100">
              Change Avatar
            </button>
          </section>

          <section className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
            <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-700">
              Security Restriction
            </p>
            <p className="mt-2 text-xs leading-5 text-emerald-950">
              System settings are available only to Super Admin users. Updates here affect the shared shop profile and pawnshop policy defaults.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
