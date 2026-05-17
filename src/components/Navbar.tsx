"use client";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { FaRightToBracket, FaRightFromBracket } from "react-icons/fa6";
import { LuUserRound } from "react-icons/lu";
import { FiInfo } from "react-icons/fi";
import { CiTrophy } from "react-icons/ci";
import Logo from "../public/Logo.svg";
import { useMemo, useState } from "react";
import { IoShieldOutline } from "react-icons/io5";
import { FaInstagram } from "react-icons/fa";

import Image from "next/image";
type NavLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export default function App() {
  // Get the real current path from Next.js
  const pathname = usePathname();
  const router = useRouter();

  const { user, appUser, logout } = useAuth();

  const isLoggedIn = !!user;
  const isAdmin = !!appUser?.admin;
  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };
  const navLinks: NavLink[] = useMemo(
    () => [
      { href: "/challenges", label: "التحديات", icon: CiTrophy },
      { href: "/about", label: "عن التحدي", icon: FiInfo },
    ],
    [],
  );

  const authLinks = useMemo(() => {
    if (!isLoggedIn) return navLinks;

    return [
      ...navLinks,
      { href: "/profile", label: "الملف الشخصي", icon: LuUserRound },
      ...(isAdmin
        ? [{ href: "/admin", label: "لوحة التحكم", icon: IoShieldOutline }]
        : [
            {
              href: "https://www.instagram.com/al.jiyad0/",
              label: "تابعونا",
              icon: FaInstagram,
            },
          ]),
    ];
  }, [isAdmin, isLoggedIn, navLinks]);

  const mobileLinks = useMemo(() => authLinks.slice(0, 4), [authLinks]);

  const isActive = (href: string) => pathname === href;

  return (
    <div className="" dir="rtl">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-amber-300/20 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto hidden md:flex h-16 max-w-6xl items-center justify-between px-4">
          {/* Logo Link */}
          <Link href="/challenges" className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-200/15 text-amber-200">
              <Image alt="logo" src={Logo} />
            </div>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {authLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  isActive(link.href)
                    ? "bg-amber-gold text-amber-100"
                    : "text-gold/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {/* Icons sized with w-4 h-4 (16px) */}
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}

            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="mr-2 flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-red-300 transition-all bg-red"
              >
                <FaRightFromBracket className="w-3 h-3" />
                خروج
              </button>
            ) : (
              <div className="mr-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push("/auth/login")}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-amber-100 transition-all bg-amber-400/10"
                >
                  <FaRightToBracket className="w-3 h-3" />
                  دخول
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/auth/register")}
                  className="flex items-center gap-2 rounded-lg bg-amber-200 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-100"
                >
                  <LuUserRound className="w-4 h-4" />
                  حساب جديد
                </button>
              </div>
            )}
          </div>

          {/* Mobile Header Actions */}
          <div className="flex items-center gap-2 md:hidden">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-10 items-center rounded-full border border-white/15 px-4 text-sm font-semibold text-white/90 transition hover:border-white/30"
              >
                <FaRightFromBracket className="w-4 h-4 ml-2" />
                خروج
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.push("/auth/login")}
                className="inline-flex h-10 items-center rounded-full bg-amber-200 px-4 text-sm font-semibold text-slate-950 transition hover:bg-amber-100"
              >
                <FaRightToBracket className="w-4 h-4 ml-2" />
                دخول
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation - Now using Link for real navigation */}
      <nav className="fixed z-50 border border-white/10 bg-white w-full p-1.5 backdrop-blur-xl md:hidden bottom-0">
        <div className="grid grid-cols-4 gap-1">
          {mobileLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex min-h-14 w-full flex-col items-center justify-center x-1 transition ${
                isActive(link.href)
                  ? "text-gold"
                  : "text-black hover:text-gold/80"
              }`}
            >
              {/* Icons sized with w-5 h-5 (20px) for mobile visibility */}
              <link.icon className="w-5 h-5" />
              <span className="text-[13px]">{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
