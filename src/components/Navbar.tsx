"use client";
import {
  Home,
  Info,
  LogIn,
  LogOut,
  Shield,
  Trophy,
  UserPlus,
} from "lucide-react";
import { useMemo, useState } from "react";

type NavLink = {
  href: string;
  label: string;
  icon: typeof Home;
};

export default function App() {
  const [activePath, setActivePath] = useState("/challenges");
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true);

  const navLinks: NavLink[] = useMemo(
    () => [
      { href: "/challenges", label: "التحديات", icon: Home },
      { href: "/about", label: "حول التحدي", icon: Info },
    ],
    [],
  );

  const authLinks = useMemo(() => {
    if (!isLoggedIn) return navLinks;

    return [
      ...navLinks,
      { href: "/profile", label: "الملف الشخصي", icon: Trophy },
      ...(isAdmin
        ? [{ href: "/admin", label: "لوحة التحكم", icon: Shield }]
        : []),
    ];
  }, [isAdmin, isLoggedIn, navLinks]);

  const mobileLinks = useMemo(() => authLinks.slice(0, 4), [authLinks]);

  const isActive = (href: string) => activePath === href;

  return (
    <div className="" dir="rtl">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-amber-300/20 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto hidden md:flex h-16 max-w-6xl items-center justify-between px-4">
          <button
            type="button"
            onClick={() => setActivePath("/challenges")}
            className="flex items-center gap-2"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-200/15 text-amber-200">
              <span className="text-xs font-bold">LOGO</span>
            </div>
          </button>

          <div className="hidden items-center gap-1 md:flex">
            {authLinks.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => setActivePath(link.href)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  isActive(link.href)
                    ? "bg-amber-200/20 text-amber-100"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <link.icon size={16} />
                {link.label}
              </button>
            ))}

            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => setIsLoggedIn(false)}
                className="mr-2 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-red-300 transition-all hover:bg-red-500/10"
              >
                <LogOut size={16} />
                خروج
              </button>
            ) : (
              <div className="mr-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsLoggedIn(true)}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-amber-100 transition-all hover:bg-amber-400/10"
                >
                  <LogIn size={16} />
                  دخول
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg bg-amber-200 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-100"
                >
                  <UserPlus size={16} />
                  حساب جديد
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => setIsLoggedIn(false)}
                className="inline-flex h-10 items-center rounded-full border border-white/15 px-4 text-sm font-semibold text-white/90 transition hover:border-white/30"
              >
                <LogOut size={16} className="ml-2" />
                خروج
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoggedIn(true)}
                className="inline-flex h-10 items-center rounded-full bg-amber-200 px-4 text-sm font-semibold text-slate-950 transition hover:bg-amber-100"
              >
                <LogIn size={16} className="ml-2" />
                دخول
              </button>
            )}
          </div>
        </div>
      </nav>

      <nav className="fixed inset-x-3 bottom-3 z-50 border border-white/10 bg-slate-900/95 p-1.5 backdrop-blur-xl md:hidden [padding-bottom:calc(0.375rem+env(safe-area-inset-bottom))]">
        <div className="grid grid-cols-4 gap-1">
          {mobileLinks.map((link) => (
            <button
              key={link.href}
              type="button"
              onClick={() => setActivePath(link.href)}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold transition ${
                isActive(link.href)
                  ? "bg-amber-200/20 text-amber-100"
                  : "text-white/65 hover:bg-white/5 hover:text-white"
              }`}
            >
              <link.icon size={17} />
              <span>{link.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
