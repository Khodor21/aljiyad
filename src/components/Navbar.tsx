"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useMemo } from "react";

import {
  FaRightToBracket,
  FaRightFromBracket,
  FaInstagram,
} from "react-icons/fa6";
import { LuUserRound } from "react-icons/lu";
import { FiInfo } from "react-icons/fi";
import { CiTrophy } from "react-icons/ci";
import { IoShieldOutline } from "react-icons/io5";

import Logo from "../public/Logo.svg";
import Image from "next/image";

type NavLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export default function App() {
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

  // ✅ ALWAYS visible links
  const persistentLinks: NavLink[] = useMemo(
    () => [
      { href: "/profile", label: "الملف الشخصي", icon: LuUserRound },
      {
        href: "https://www.instagram.com/al.jiyad0/",
        label: "تابعونا",
        icon: FaInstagram,
      },
    ],
    [],
  );

  const authLinks: NavLink[] = useMemo(() => {
    return [
      ...navLinks,
      ...persistentLinks,
      ...(isLoggedIn && isAdmin
        ? [{ href: "/admin", label: "لوحة التحكم", icon: IoShieldOutline }]
        : []),
    ];
  }, [navLinks, persistentLinks, isLoggedIn, isAdmin]);

  const mobileLinks = useMemo(() => authLinks.slice(0, 4), [authLinks]);

  const isActive = (href: string) => pathname === href;

  return (
    <div dir="rtl">
      {/* DESKTOP NAVBAR ONLY */}
      <nav className="fixed inset-x-0 top-0 z-50 hidden border-b border-amber-300/20 bg-white/90 backdrop-blur-xl md:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/challenges" className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-200/15">
              <Image alt="logo" src={Logo} />
            </div>
          </Link>

          {/* LINKS */}
          <div className="flex items-center gap-1">
            {authLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  isActive(link.href)
                    ? "bg-amber-gold text-amber-100"
                    : "text-gold/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}

            {/* AUTH BUTTONS DESKTOP ONLY */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="mr-2 flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-red-300"
              >
                <FaRightFromBracket className="w-3 h-3" />
                خروج
              </button>
            ) : (
              <div className="mr-2 flex items-center gap-2">
                <button
                  onClick={() => router.push("/auth/login")}
                  className="flex items-center gap-2 rounded-lg bg-amber-400/10 px-4 py-2 text-xs font-semibold text-amber-100"
                >
                  <FaRightToBracket className="w-3 h-3" />
                  دخول
                </button>

                <button
                  onClick={() => router.push("/auth/register")}
                  className="flex items-center gap-2 rounded-lg bg-amber-200 px-4 py-2 text-sm font-semibold text-slate-950"
                >
                  <LuUserRound className="w-4 h-4" />
                  حساب جديد
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-0 z-50 w-full border bg-white p-1.5 md:hidden">
        <div className="grid grid-cols-4 gap-1">
          {mobileLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center ${
                isActive(link.href) ? "text-gold" : "text-black"
              }`}
            >
              <link.icon className="h-5 w-5" />
              <span className="text-[13px]">{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
