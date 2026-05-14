"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { LogIn, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { login } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!username.trim() || !password.trim()) {
      setErrorMsg("يرجى ملء جميع الحقول");
      return;
    }

    setLoading(true);
    const error = await login(username.trim(), password);

    if (error) {
      setErrorMsg(error);
      showToast(error, "error");
      setLoading(false);
      return;
    }

    showToast("تم تسجيل الدخول بنجاح");
    router.push("/challenges");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* العنوان */}
        <div className="text-center mb-8">
          {/* <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-4 shadow-lg">
            <LogIn size={20} className="text-white" />
          </div> */}
          <div className="flex items-center text-center w-full mx-auto justify-center gap-1">
            {" "}
            <h1 className="text-3xl font-bold text-slate-900">تسجيل الدخول</h1>
          </div>
          <p className="text-sm text-slate-500 mt-2">
            أدخل بياناتك للمتابعة في التحدي
          </p>
        </div>

        {/* رسالة الخطأ */}
        {errorMsg && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium text-center">
            {errorMsg}
          </div>
        )}

        {/* النموذج - Primary Background */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#f1f1f1] border-0 p-8 rounded-2xl space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              اسم المستخدم
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrorMsg("");
              }}
              className="input-field mt-1 !bg-white/10 !text-slate-900 !border-slate-300 !placeholder:text-slate-500 !focus:bg-white/20 !focus:border-slate-500"
              placeholder="أدخل اسم المستخدم"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMsg("");
              }}
              className="input-field !bg-white/10 !text-slate-900 !border-slate-300 !placeholder:text-slate-500 !focus:bg-white/20 !focus:border-slate-500"
              placeholder="أدخل كلمة المرور"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full shadow-lg"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <LogIn size={18} />
            )}
            {loading ? "جارٍ الدخول..." : "تسجيل الدخول"}
          </button>

          <p className="text-center text-sm text-slate-500">
            ليس لديك حساب؟{" "}
            <Link
              href="/auth/register"
              className="text-gold font-bold hover:underline hover:text-amber-200"
            >
              أنشئ حسابًا جديدًا
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
