'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { UserPlus, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [age, setAge] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const { register } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const validate = (): boolean => {
    setErrorMsg('')

    if (!username.trim() || !phone.trim() || !age || !password || !confirmPassword) {
      setErrorMsg('يرجى ملء جميع الحقول')
      return false
    }
    if (username.trim().length < 3) {
      setErrorMsg('اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
      return false
    }
    // if (d{8}$/.test(phone.trim())) {
    //   setErrorMsg('رقم الجوال يجب أن يبدأ بـ 05 ويكون 10 أرقام')
    //   return false
    // }
    const ageNum = parseInt(age)
    if (isNaN(ageNum) || ageNum < 10 || ageNum > 120) {
      setErrorMsg('العمر يجب أن يكون بين 10 و 120')
      return false
    }
    if (password.length < 6) {
      setErrorMsg('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return false
    }
    if (password !== confirmPassword) {
      setErrorMsg('كلمتا المرور غير متطابقتين')
      return false
    }
    return true
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!validate()) return

    setLoading(true)
    const error = await register(username.trim(), password, phone.trim(), parseInt(age))

    if (error) {
      setErrorMsg(error)
      showToast(error, 'error')
      setLoading(false)
      return
    }

    showToast('تم إنشاء الحساب بنجاح — مرحبًا بك')
    router.push('/challenges')
  }

  return (
    <div className="min-h-screen islamic-pattern flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* العنوان */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-4">
            <UserPlus size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">إنشاء حساب جديد</h1>
          <p className="text-sm text-white/40 mt-2">انضم لتحدي العشر الأوائل من ذي الحجة</p>
        </div>

        {/* رسالة الخطأ */}
        {errorMsg && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/15 border border-red-500/25 text-red-300 text-sm font-medium text-center">
            {errorMsg}
          </div>
        )}

        {/* النموذج */}
        <form onSubmit={handleSubmit} className="card p-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">اسم المستخدم</label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setErrorMsg('') }}
              className="input-field"
              placeholder="مثال: أحمد"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">رقم الجوال</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value.replace(/[^0-9]/g, '')); setErrorMsg('') }}
              className="input-field"
              placeholder="05XXXXXXXX"
              dir="ltr"
              style={{ textAlign: 'left' }}
              maxLength={10}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">العمر</label>
            <input
              type="number"
              value={age}
              onChange={(e) => { setAge(e.target.value); setErrorMsg('') }}
              className="input-field"
              placeholder="أدخل عمرك"
              min="10"
              max="120"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrorMsg('') }}
              className="input-field"
              placeholder="6 أحرف على الأقل"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">تأكيد كلمة المرور</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setErrorMsg('') }}
              className="input-field"
              placeholder="أعد كتابة كلمة المرور"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full !mt-6"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
            {loading ? 'جارٍ الإنشاء...' : 'إنشاء الحساب'}
          </button>

          <p className="text-center text-sm text-white/40">
            لديك حساب بالفعل؟{' '}
            <Link href="/auth/login" className="text-gold-light font-bold hover:underline">
              سجل دخولك
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}