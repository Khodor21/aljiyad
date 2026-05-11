'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { db } from '@/lib/firebase'
import defaultChallenges from '@/lib/challenges.json'
import {
  collection,
  getDocs,
  doc,
  setDoc,
  query,
} from 'firebase/firestore'
import {
  Loader2,
  Plus,
  Trash2,
  Save,
  Shield,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface Task {
  id: string
  name: string
  points: number
}

interface DayData {
  id: number
  title: string
  description: string
  icon: string
  tasks: Task[]
}

const iconOptions = ['heart', 'clock', 'sun', 'book-open', 'repeat', 'gift', 'users', 'mountain', 'star', 'trophy']

export default function AdminPage() {
  const { user, appUser, loading: authLoading } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const [days, setDays] = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedDay, setExpandedDay] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  // حماية الصفحة
  useEffect(() => {
    if (authLoading) return
    if (!user || !appUser?.admin) {
      router.push('/challenges')
    }
  }, [user, appUser, authLoading, router])

  // تحميل البيانات
  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, 'challenges'))
        if (!snap.empty) {
          const data = snap.docs
            .map((d) => ({ id: Number(d.id), ...d.data() } as DayData))
            .sort((a, b) => a.id - b.id)
          setDays(data)
        } else {
          setDays(JSON.parse(JSON.stringify(defaultChallenges)))
        }
      } catch {
        setDays(JSON.parse(JSON.stringify(defaultChallenges)))
      } finally {
        setLoading(false)
      }
    }
    if (user && appUser?.admin) load()
  }, [user, appUser])

  // تحديث حقل في يوم
  const updateDayField = (dayId: number, field: string, value: string) => {
    setDays((prev) =>
      prev.map((d) => (d.id === dayId ? { ...d, [field]: value } : d))
    )
  }

  // إضافة مهمة جديدة
  const addTask = (dayId: number) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.id !== dayId) return d
        const newId = `${dayId}_${Date.now()}`
        return { ...d, tasks: [...d.tasks, { id: newId, name: '', points: 10 }] }
      })
    )
  }

  // تحديث مهمة
  const updateTask = (dayId: number, taskId: string, field: string, value: string | number) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.id !== dayId) return d
        return {
          ...d,
          tasks: d.tasks.map((t) => (t.id === taskId ? { ...t, [field]: value } : t)),
        }
      })
    )
  }

  // حذف مهمة
  const removeTask = (dayId: number, taskId: string) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.id !== dayId) return d
        return { ...d, tasks: d.tasks.filter((t) => t.id !== taskId) }
      })
    )
  }

  // إعادة تعيين معرّفات المهام
  const reindexTasks = (dayId: number) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.id !== dayId) return d
        return {
          ...d,
          tasks: d.tasks.map((t, i) => ({ ...t, id: `${dayId}_${i}` })),
        }
      })
    )
  }

  // حفظ جميع الأيام
  const saveAll = async () => {
    setSaving(true)
    try {
      for (const day of days) {
        const dayToSave = { ...day }
        // إعادة فهرسة المهام قبل الحفظ
        dayToSave.tasks = dayToSave.tasks.map((t, i) => ({ ...t, id: `${day.id}_${i}` }))
        await setDoc(doc(db, 'challenges', String(day.id)), dayToSave)
      }
      showToast('تم حفظ جميع التعديلات بنجاح')
    } catch (err) {
      console.error(err)
      showToast('حدث خطأ أثناء الحفظ', 'error')
    } finally {
      setSaving(false)
    }
  }

  // إعادة تحميل من JSON الافتراضي
  const resetToDefault = () => {
    setDays(JSON.parse(JSON.stringify(defaultChallenges)))
    showToast('تم إعادة التعيين إلى القيم الافتراضية', 'info')
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen islamic-pattern flex items-center justify-center">
        <Loader2 size={40} className="text-gold animate-spin" />
      </div>
    )
  }

  if (!user || !appUser?.admin) return null

  return (
    <div className="min-h-screen islamic-pattern-dark">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* الترويسة */}
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center">
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">لوحة التحكم</h1>
              <p className="text-xs text-white/40">إدارة التحديات والمهام</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetToDefault}
              className="px-4 py-2 rounded-xl border border-red-500/30 text-red-300 text-sm font-semibold hover:bg-red-500/10 transition-all"
            >
              إعادة تعيين
            </button>
            <button
              onClick={saveAll}
              disabled={saving}
              className="btn-gold text-sm flex items-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'جارٍ الحفظ...' : 'حفظ الكل'}
            </button>
          </div>
        </div>

        {/* أيام التحدي */}
        <div className="space-y-3">
          {days.map((day, idx) => {
            const isExpanded = expandedDay === day.id

            return (
              <div
                key={day.id}
                className="card overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {/* رأس اليوم */}
                <button
                  onClick={() => setExpandedDay(isExpanded ? null : day.id)}
                  className="w-full text-right p-5 flex items-center gap-4 hover:bg-white/[0.02] transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-black text-gold-light">{day.id}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={day.title}
                      onChange={(e) => {
                        e.stopPropagation()
                        updateDayField(day.id, 'title', e.target.value)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-transparent border-none outline-none text-white font-bold text-sm w-full"
                      dir="rtl"
                    />
                    <input
                      type="text"
                      value={day.description}
                      onChange={(e) => {
                        e.stopPropagation()
                        updateDayField(day.id, 'description', e.target.value)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-transparent border-none outline-none text-white/40 text-xs w-full mt-0.5"
                      dir="rtl"
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gold/50">{day.tasks.length} مهام</span>
                    {isExpanded ? (
                      <ChevronUp size={18} className="text-white/30" />
                    ) : (
                      <ChevronDown size={18} className="text-white/30" />
                    )}
                  </div>
                </button>

                {/* تفاصيل اليوم */}
                {isExpanded && (
                  <div className="border-t border-gold/10 p-5 space-y-4">
                    {/* اختيار الأيقونة */}
                    <div>
                      <label className="block text-xs font-semibold text-white/40 mb-2">الأيقونة</label>
                      <div className="flex flex-wrap gap-2">
                        {iconOptions.map((icon) => (
                          <button
                            key={icon}
                            onClick={() => updateDayField(day.id, 'icon', icon)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              day.icon === icon
                                ? 'bg-gold/20 text-gold-light border border-gold/40'
                                : 'bg-white/5 text-white/40 border border-transparent hover:bg-white/10'
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* قائمة المهام */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-semibold text-white/40">المهام</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => reindexTasks(day.id)}
                            className="text-[10px] text-white/30 hover:text-white/50 transition-all"
                          >
                            إعادة فهرسة
                          </button>
                          <button
                            onClick={() => addTask(day.id)}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gold/15 text-gold-light text-xs font-semibold hover:bg-gold/25 transition-all"
                          >
                            <Plus size={14} />
                            إضافة مهمة
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {day.tasks.map((task, taskIdx) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5"
                          >
                            <span className="text-xs text-white/20 w-5 text-center flex-shrink-0">
                              {taskIdx + 1}
                            </span>
                            <input
                              type="text"
                              value={task.name}
                              onChange={(e) =>
                                updateTask(day.id, task.id, 'name', e.target.value)
                              }
                              placeholder="اسم المهمة"
                              className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-white/20"
                              dir="rtl"
                            />
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <input
                                type="number"
                                value={task.points}
                                onChange={(e) =>
                                  updateTask(day.id, task.id, 'points', parseInt(e.target.value) || 0)
                                }
                                className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-center text-gold-light text-xs font-bold outline-none focus:border-gold/40"
                                min="0"
                                max="100"
                              />
                              <span className="text-[10px] text-white/30">نقطة</span>
                            </div>
                            <button
                              onClick={() => removeTask(day.id, task.id)}
                              className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}

                        {day.tasks.length === 0 && (
                          <p className="text-center text-white/20 text-xs py-6">
                            لا توجد مهام — أضف مهمة جديدة
                          </p>
                        )}
                      </div>
                    </div>

                    {/* مجموع النقاط */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <span className="text-xs text-white/30">مجموع نقاط اليوم</span>
                      <span className="text-sm font-bold text-gold-light">
                        {day.tasks.reduce((s, t) => s + t.points, 0)} نقطة
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}