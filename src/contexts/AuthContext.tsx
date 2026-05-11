'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth'
import { doc, setDoc, getDoc, getDocs, query, collection, where, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

interface AppUser {
  uid: string
  username: string
  phone: string
  age: number
  points: number
  admin: boolean
  createdAt: any
}

interface AuthContextType {
  user: User | null
  appUser: AppUser | null
  loading: boolean
  login: (username: string, password: string) => Promise<string | null>
  register: (username: string, password: string, phone: string, age: number) => Promise<string | null>
  logout: () => Promise<void>
  refreshAppUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAppUser = async (uid: string) => {
    try {
      const docSnap = await getDoc(doc(db, 'users', uid))
      if (docSnap.exists()) {
        setAppUser({ uid, ...docSnap.data() } as AppUser)
      }
    } catch (e) {
      console.error('خطأ في تحميل بيانات المستخدم:', e)
    }
  }

  const refreshAppUser = async () => {
    if (user) await fetchAppUser(user.uid)
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        await fetchAppUser(firebaseUser.uid)
      } else {
        setAppUser(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  // تسجيل الدخول — يرجع رسالة خطأ أو null
  const login = async (username: string, password: string): Promise<string | null> => {
    try {
      // البحث عن المستخدم بالاسم
      const q = query(collection(db, 'users'), where('username', '==', username.trim()))
      const snap = await getDocs(q)

      if (snap.empty) {
        return 'اسم المستخدم غير موجود'
      }

      const userData = snap.docs[0].data()
      const phone = userData.phone as string

      // تحويل 05XXXXXXXX → +966XXXXXXXX
      const cleanPhone = phone.replace(/^0/, '')
      const email = `966${cleanPhone}@challenge.app`

      await signInWithEmailAndPassword(auth, email, password)
      return null
    } catch (err: any) {
      console.error('خطأ الدخول:', err)
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password') {
        return 'كلمة المرور غير صحيحة'
      }
      if (err?.code === 'auth/too-many-requests') {
        return 'محاولات كثيرة، انتظر قليلاً ثم حاول مجدداً'
      }
      if (err?.code === 'auth/invalid-email') {
        return 'بيانات الدخول غير صحيحة'
      }
      return 'حدث خطأ أثناء تسجيل الدخول'
    }
  }

  // إنشاء حساب — يرجع رسالة خطأ أو null
  const register = async (username: string, password: string, phone: string, age: number): Promise<string | null> => {
    try {
      // تحويل 05XXXXXXXX → +966XXXXXXXX (أرقام فقط، بدون عربي)
      const cleanPhone = phone.replace(/^0/, '')
      const email = `+966${cleanPhone}@challenge.app`

      // إنشاء الحساب في Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, email, password)

      // التحقق: هل أول مستخدم؟ (يصبح أدمن)
      let isFirstUser = false
      try {
        const metaSnap = await getDoc(doc(db, 'meta', 'stats'))
        isFirstUser = !metaSnap.exists()
      } catch {
        isFirstUser = true
      }

      // حفظ بيانات المستخدم في Firestore
      await setDoc(doc(db, 'users', cred.user.uid), {
        username: username.trim(),
        phone: phone.trim(),
        age,
        points: 0,
        admin: isFirstUser,
        createdAt: serverTimestamp(),
      })

      // إنشاء مستند الإحصائيات إذا كان أول مستخدم
      if (isFirstUser) {
        await setDoc(doc(db, 'meta', 'stats'), { totalUsers: 1 })
      }

      return null
    } catch (err: any) {
      console.error('خطأ التسجيل:', err)

      // تراجع: حذف الحساب من Auth إذا فشل حفظ البيانات
      try {
        if (auth.currentUser) {
          await auth.currentUser.delete()
        }
      } catch {
        // تجاهل خطأ الحذف
      }

      if (err?.code === 'auth/email-already-in-use') {
        return 'رقم الجوال مسجل بالفعل، جرّب تسجيل الدخول'
      }
      if (err?.code === 'auth/weak-password') {
        return 'كلمة المرور ضعيفة، استخدم 6 أحرف على الأقل'
      }
      if (err?.code === 'auth/invalid-email') {
        return 'رقم الجوال غير صالح'
      }
      if (err?.code === 'auth/network-request-failed') {
        return 'مشكلة في الاتصال بالإنترنت'
      }
      return 'حدث خطأ أثناء إنشاء الحساب'
    }
  }

  const logout = async () => {
    try {
      await firebaseSignOut(auth)
    } catch {
      // تجاهل
    }
    setAppUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, appUser, loading, login, register, logout, refreshAppUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)