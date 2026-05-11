"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Menu,
  X,
  LogIn,
  UserPlus,
  LogOut,
  Trophy,
  BookOpen,
  Info,
  Shield,
  Home,
} from "lucide-react";
import { useState } from "react";
import Logo from "../public/Logo.svg"

export default function Navbar() {
  const { user, appUser, loading, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/challenges", label: "التحديات", icon: Home },
    { href: "/about", label: "حول التحدي", icon: Info },
  ];

  const authLinks = user
    ? [
        ...navLinks,
        { href: "/profile", label: "الملف الشخصي", icon: Trophy },
        ...(appUser?.admin
          ? [{ href: "/admin", label: "لوحة التحكم", icon: Shield }]
          : []),
      ]
    : navLinks;

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 islamic-pattern border-b border-gold/20">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* الشعار */}
        <Link href="/challenges" className="flex items-center gap-2">
         <Image src={Logo} alt="logo is here" className="w-12 h-12 text-yellow" />
        </Link>

        {/* روابط سطح المكتب */}
        <div className="hidden md:flex items-center gap-1">
          {authLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                isActive(link.href)
                  ? "bg-gold/20 text-gold-light"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <link.icon size={16} />
              {link.label}
            </Link>
          ))}

          {user ? (
            <button
              onClick={logout}
              className="mr-2 px-4 py-2 rounded-lg text-sm font-semibold text-red-300 hover:bg-red-500/10 transition-all flex items-center gap-2"
            >
              <LogOut size={16} />
              خروج
            </button>
          ) : (
            <div className="mr-2 flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-lg text-sm font-semibold text-gold-light hover:bg-gold/10 transition-all flex items-center gap-2"
              >
                <LogIn size={16} />
                دخول
              </Link>
              <Link
                href="/auth/register"
                className="btn-gold text-sm !py-2 !px-4 flex items-center gap-2"
              >
                <UserPlus size={16} />
                حساب جديد
              </Link>
            </div>
          )}
        </div>

        {/* زر القائمة للجوال */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-white p-2"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* قائمة الجوال */}
      {mobileOpen && (
        <div className="md:hidden islamic-pattern-dark border-t border-gold/10 px-4 py-3 space-y-1">
          {authLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-all flex items-center gap-3 ${
                isActive(link.href)
                  ? "bg-gold/20 text-gold-light"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          ))}

          {user ? (
            <button
              onClick={() => {
                logout();
                setMobileOpen(false);
              }}
              className="w-full text-right px-4 py-3 rounded-lg text-sm font-semibold text-red-300 hover:bg-red-500/10 transition-all flex items-center gap-3"
            >
              <LogOut size={18} />
              تسجيل الخروج
            </button>
          ) : (
            <div className="pt-2 space-y-2">
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center px-4 py-3 rounded-lg text-sm font-semibold text-gold-light border border-gold/30 hover:bg-gold/10 transition-all"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center btn-gold text-sm"
              >
                إنشاء حساب
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
