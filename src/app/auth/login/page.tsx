'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { LogIn, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const { login } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!username.trim() || !password.trim()) {
      setErrorMsg('يرجى ملء جميع الحقول')
      return
    }

    setLoading(true)
    const error = await login(username.trim(), password)

    if (error) {
      setErrorMsg(error)
      showToast(error, 'error')
      setLoading(false)
      return
    }

    showToast('تم تسجيل الدخول بنجاح')
    router.push('/challenges')
  }

  return (
    <div className="min-h-screen islamic-pattern flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* العنوان */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-4">
            <LogIn size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">تسجيل الدخول</h1>
          <p className="text-sm text-white/40 mt-2">أدخل بياناتك للمتابعة في التحدي</p>
        </div>

        {/* رسالة الخطأ */}
        {errorMsg && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/15 border border-red-500/25 text-red-300 text-sm font-medium text-center">
            {errorMsg}
          </div>
        )}

        {/* النموذج */}
        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">اسم المستخدم</label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setErrorMsg('') }}
              className="input-field"
              placeholder="أدخل اسم المستخدم"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrorMsg('') }}
              className="input-field"
              placeholder="أدخل كلمة المرور"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
            {loading ? 'جارٍ الدخول...' : 'تسجيل الدخول'}
          </button>

          <p className="text-center text-sm text-white/40">
            ليس لديك حساب؟{' '}
            <Link href="/auth/register" className="text-gold-light font-bold hover:underline">
              أنشئ حسابًا جديدًا
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}