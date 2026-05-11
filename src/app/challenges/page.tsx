"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { db } from "@/lib/firebase";
import { CHALLENGE_START_DATE, CHALLENGE_DURATION_DAYS } from "@/lib/config";
import defaultChallenges from "@/lib/challenges.json";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import DayCard from "@/components/DayCard";
import TaskItem from "@/components/TaskItem";
import { Loader2, TrendingUp, Calendar } from "lucide-react";

interface Task {
  id: string;
  name: string;
  points: number;
}

interface DayData {
  id: number;
  title: string;
  description: string;
  icon: string;
  tasks: Task[];
}

export default function ChallengesPage() {
  const { user, appUser, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [days, setDays] = useState<DayData[]>([]);
  const [completions, setCompletions] = useState<
    Record<string, { completed: boolean; completedAt: any; points: number }>
  >({});
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingTask, setTogglingTask] = useState<string | null>(null);

  // حساب الأيام المفتوحة
  const getUnlockedDays = (): number => {
    const now = new Date();
    const diffMs = now.getTime() - CHALLENGE_START_DATE.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.min(Math.max(diffDays + 1, 1), CHALLENGE_DURATION_DAYS);
  };

  const unlockedDays = getUnlockedDays();

  // تحميل التحديات من فايربيز أو من JSON الافتراضي
  useEffect(() => {
    const loadChallenges = async () => {
      try {
        const snap = await getDocs(collection(db, "challenges"));
        if (!snap.empty) {
          const data = snap.docs
            .map((d) => ({ id: Number(d.id), ...d.data() }) as DayData)
            .sort((a, b) => a.id - b.id);
          setDays(data);
        } else {
          setDays(defaultChallenges as DayData[]);
        }
      } catch {
        setDays(defaultChallenges as DayData[]);
      }
    };
    loadChallenges();
  }, []);

  // تحميل إكمالات المستخدم
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadCompletions = async () => {
      try {
        const snap = await getDocs(
          collection(db, "completions", user.uid, "tasks"),
        );
        const map: Record<string, any> = {};
        snap.forEach((d) => {
          map[d.id] = d.data();
        });
        setCompletions(map);
      } catch (err) {
        console.error("خطأ في تحميل الإكمالات:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCompletions();
  }, [user]);

  // تبديل حالة المهمة
  const toggleTask = async (taskId: string) => {
    if (!user || togglingTask) return;
    setTogglingTask(taskId);

    try {
      const taskRef = doc(db, "completions", user.uid, "tasks", taskId);
      const dayId = parseInt(taskId.split("_")[0]);
      const day = days.find((d) => d.id === dayId);
      const task = day?.tasks.find((t) => t.id === taskId);

      if (!task) return;

      if (completions[taskId]) {
        // إلغاء الإكمال
        await deleteDoc(taskRef);
        setCompletions((prev) => {
          const next = { ...prev };
          delete next[taskId];
          return next;
        });
        // خصم النقاط
        if (appUser) {
          await updateDoc(doc(db, "users", user.uid), {
            points: Math.max(0, (appUser.points || 0) - task.points),
          });
        }
        showToast("تم إلغاء إكمال المهمة", "info");
      } else {
        // إكمال المهمة
        await setDoc(taskRef, {
          completed: true,
          completedAt: serverTimestamp(),
          points: task.points,
        });
        setCompletions((prev) => ({
          ...prev,
          [taskId]: {
            completed: true,
            completedAt: new Date(),
            points: task.points,
          },
        }));
        // إضافة النقاط
        if (appUser) {
          await updateDoc(doc(db, "users", user.uid), {
            points: (appUser.points || 0) + task.points,
          });
        }
        showToast(`تم إكمال المهمة — +${task.points} نقطة`);
      }
    } catch (err) {
      showToast("حدث خطأ، حاول مرة أخرى", "error");
    } finally {
      setTogglingTask(null);
    }
  };

  // حساب النقاط والإحصائيات
  const totalPoints = Object.values(completions).reduce(
    (sum, c) => sum + (c.points || 0),
    0,
  );
  const totalCompleted = Object.keys(completions).length;
  const totalTasks = days.reduce((sum, d) => sum + d.tasks.length, 0);
  const overallProgress =
    totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;

  // الحالة الحالية (قبل تحميل أو بدون تسجيل)
  if (authLoading || loading) {
    return (
      <div className="min-h-screen islamic-pattern flex items-center justify-center">
        <Loader2 size={40} className="text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-primary">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* الترويسة */}
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-black mb-2">
            تحدي <span className="gold-gradient-text">العشر الأوائل</span> من ذي
            الحجة
          </h1>
          {user && appUser && (
            <p className="text-sm">
             السلام عليكم، {" "}
              <span className="text-gold-light font-bold">
                {appUser.username}
              </span>
            </p>
          )}
        </div>

        {/* شريط التقدم العام */}
        {user && (
          <div
            className="card p-5 mb-8 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-gold" />
                <span className="text-sm font-bold text-primary">
                  تقدمك العام
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-gold-light font-bold">
                  {totalPoints} نقطة
                </span>
                <span className="text-primary/40">
                  {totalCompleted}/{totalTasks} مهمة
                </span>
              </div>
            </div>
            <div className="h-2.5 bg-primary/5 rounded-full overflow-hidden">
              <div
                className="progress-bar h-full"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-primary/30">
              <Calendar size={12} />
              <span>
                الأيام المفتوحة: {unlockedDays} من {CHALLENGE_DURATION_DAYS}
              </span>
            </div>
          </div>
        )}

        {/* تنبيه تسجيل الدخول */}
        {!user && (
          <div className="card p-6 mb-8 text-center animate-fade-in-up">
            <p className="text-primary/60 mb-4">
              سجّل دخولك للمشاركة في التحدي وتتبع تقدمك
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => router.push("/auth/login")}
                className="px-6 py-2.5 rounded-xl border border-gold/30 text-gold-light font-bold text-sm hover:bg-gold/10 transition-all"
              >
                تسجيل الدخول
              </button>
              <button
                onClick={() => router.push("/auth/register")}
                className="btn-gold text-sm !py-2.5"
              >
                حساب جديد
              </button>
            </div>
          </div>
        )}

        {/* بطاقات الأيام */}
        <div className="space-y-3">
          {days.map((day, idx) => {
            const unlocked = day.id <= unlockedDays;
            const dayCompletedTasks = day.tasks.filter(
              (t) => completions[t.id],
            ).length;
            const isExpanded = expandedDay === day.id;

            return (
              <div
                key={day.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <DayCard
                  day={day}
                  unlocked={unlocked}
                  completedTasks={dayCompletedTasks}
                  totalTasks={day.tasks.length}
                  isExpanded={isExpanded}
                  onToggle={() => {
                    if (!unlocked) {
                      showToast("هذا اليوم لم يفتح بعد", "info");
                      return;
                    }
                    if (!user) {
                      router.push("/auth/login");
                      return;
                    }
                    setExpandedDay(isExpanded ? null : day.id);
                  }}
                />

                {/* المهام */}
                {isExpanded && (
                  <div className="mt-2 space-y-2 pr-4 border-r-2 border-gold/15">
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-xs font-bold text-primary/40">
                        المهام
                      </span>
                      <span className="text-xs text-gold/50">
                        مجموع النقاط:{" "}
                        {day.tasks.reduce((s, t) => s + t.points, 0)}
                      </span>
                    </div>
                    {day.tasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        completed={!!completions[task.id]}
                        completedAt={completions[task.id]?.completedAt}
                        onToggle={toggleTask}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
