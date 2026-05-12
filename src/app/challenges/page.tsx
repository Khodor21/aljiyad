"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import Banner from "../../public/Banner.png";
import Image from "next/image";
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
} from "firebase/firestore";

import type { LucideIcon } from "lucide-react"; // add this
import {
  Loader2,
  Lock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Check,
  Star,
  MapPin,
  TrendingUp,
  Calendar,
  LogIn,
  UserPlus,
  Sunrise,
  Moon,
  BookOpen,
  Heart,
  Leaf,
  Gem,
  Flame,
  Mountain,
  Bird,
  Award,
} from "lucide-react";

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

const DAY_META: Record<number, { env: string; Icon: LucideIcon }> = {
  1: { env: "صحراء النية", Icon: Sunrise },
  2: { env: "واحة الذكر", Icon: Star },
  3: { env: "بساتين التلاوة", Icon: BookOpen },
  4: { env: "جبل الدعاء", Icon: Heart },
  5: { env: "طريق البر", Icon: Leaf },
  6: { env: "نهر الصدقة", Icon: Gem },
  7: { env: "مضيق الإخلاص", Icon: Flame },
  8: { env: "سهل عرفات", Icon: Mountain },
  9: { env: "فجر العيد", Icon: Bird },
  10: { env: "أبواب مكة", Icon: Moon },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getUnlockedDays = (): number => {
  const now = new Date();
  const diffMs = now.getTime() - CHALLENGE_START_DATE.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.min(Math.max(diffDays + 1, 1), CHALLENGE_DURATION_DAYS);
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StageNode({
  day,
  unlocked,
  allDone,
  isCurrent,
  onClick,
}: {
  day: DayData;
  unlocked: boolean;
  allDone: boolean;
  isCurrent: boolean;
  onClick: () => void;
}) {
  const meta = DAY_META[day.id] ?? { env: "", Icon: Star };
  const { Icon } = meta;

  <Icon size={20} className="..." />;
  const base =
    "relative w-14 h-14 rounded-full flex flex-col items-center justify-center flex-shrink-0 border-2 transition-transform duration-200 select-none";

  const style = !unlocked
    ? "border-primary/20 bg-white/60 cursor-default"
    : allDone
      ? "border-[#3a7a2a] bg-[#eef6de] cursor-pointer hover:scale-105"
      : isCurrent
        ? "border-gold bg-white cursor-pointer hover:scale-105 shadow-[0_0_0_4px_rgba(156,97,20,0.12)] animate-pulse-soft"
        : "border-gold/50 bg-white cursor-pointer hover:scale-105";

  return (
    <button
      onClick={onClick}
      className={`${base} ${style}`}
      aria-label={`اليوم ${day.id}: ${day.title}`}
    >
      {/* Outer ring decoration */}
      <span className="absolute inset-[-5px] rounded-full border border-dashed border-gold/20 pointer-events-none" />

      {!unlocked ? (
        <Lock size={20} className="text-primary/30" />
      ) : allDone ? (
        <CheckCircle2 size={22} className="text-[#3a7a2a]" />
      ) : (
        <Icon
          size={20}
          className={isCurrent ? "text-gold" : "text-primary/70"}
        />
      )}

      <span
        className={`text-[9px] mt-0.5 font-medium font-sans leading-none ${
          !unlocked
            ? "text-primary/30"
            : allDone
              ? "text-[#3a7a2a]"
              : isCurrent
                ? "text-gold"
                : "text-primary/50"
        }`}
      >
        {allDone ? "مكتمل" : `يوم ${day.id}`}
      </span>
    </button>
  );
}

function StageCard({
  day,
  unlocked,
  doneTasks,
  isOpen,
  isCurrent,
  onClick,
}: {
  day: DayData;
  unlocked: boolean;
  doneTasks: number;
  isOpen: boolean;
  isCurrent: boolean;
  onClick: () => void;
}) {
  const meta = DAY_META[day.id] ?? { env: "", Icon: Star };
  const totalPts = day.tasks.reduce((s, t) => s + t.points, 0);

  return (
    <button
      onClick={onClick}
      disabled={!unlocked}
      className={`
        flex-1 max-w-[200px] text-right rounded-xl border px-3 py-2.5 transition-all duration-200
        ${
          !unlocked
            ? "opacity-40 cursor-default border-primary/10 bg-white/50"
            : isOpen
              ? "border-gold bg-white shadow-sm"
              : "border-primary/15 bg-white hover:border-gold/50 hover:bg-amber-50/30"
        }
      `}
    >
      {isCurrent && (
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping-soft inline-block" />
          <span className="text-[10px] text-gold font-sans">أنت هنا</span>
        </div>
      )}

      {/* Environment badge */}
      <span className="inline-block text-[9px] font-sans px-2 py-0.5 rounded-full bg-primary/8 text-primary/60 mb-1 border border-primary/10">
        {meta.env}
      </span>

      <p
        className="text-sm font-bold text-primary leading-snug"
        style={{ fontFamily: "var(--font-arabic, 'Amiri', serif)" }}
      >
        {day.title}
      </p>
      <p className="text-[10px] text-primary/50 font-sans leading-snug mt-0.5">
        {day.description}
      </p>

      {unlocked && (
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[9px] font-sans border border-gold/30 text-gold rounded-full px-2 py-0.5">
            {doneTasks}/{day.tasks.length} مهام
          </span>
          <span className="text-[9px] font-sans text-primary/40">
            {totalPts} نقطة
          </span>
        </div>
      )}

      {!unlocked && (
        <span className="text-[9px] font-sans text-primary/30 mt-1 block">
          مقفل
        </span>
      )}
    </button>
  );
}

function TaskRow({
  task,
  completed,
  toggling,
  onToggle,
}: {
  task: Task;
  completed: boolean;
  toggling: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onToggle(task.id)}
      disabled={toggling}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-right transition-all duration-150
        ${
          completed
            ? "bg-[#eef6de] border-[#a8d07a]/40"
            : "bg-white border-primary/10 hover:border-gold/30 hover:bg-amber-50/20"
        }
        ${toggling ? "opacity-60 cursor-wait" : "cursor-pointer"}
      `}
    >
      <div
        className={`
          w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
          ${completed ? "bg-[#3a7a2a] border-[#3a7a2a]" : "border-gold/40 bg-white"}
        `}
      >
        {completed && (
          <Check size={13} className="text-white" strokeWidth={2.5} />
        )}
        {toggling && !completed && (
          <Loader2 size={12} className="animate-spin text-gold" />
        )}
      </div>

      <span
        className={`flex-1 text-xs font-sans leading-snug ${
          completed
            ? "text-[#3a7a2a] line-through decoration-[#3a7a2a]/40"
            : "text-primary"
        }`}
      >
        {task.name}
      </span>

      <span className="text-[10px] font-sans text-gold font-medium flex-shrink-0">
        +{task.points}
      </span>
    </button>
  );
}

function KaabaDestination({ unlocked }: { unlocked: boolean }) {
  return (
    <div className="mx-4 mt-6 rounded-2xl overflow-hidden border-2 border-gold/40">
      {/* Dark header mimicking the Kaaba */}
      <div className="bg-primary-dark relative flex flex-col items-center py-6 px-4">
        {/* Kaaba shape */}
        <div className="relative w-16 h-20 bg-[#111] rounded border-2 border-gold/60 mb-3">
          {/* Kiswa band */}
          <div className="absolute top-6 left-0 right-0 h-3 bg-gold/80" />
          {/* Door */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-7 bg-gold/70 rounded-t" />
        </div>
        <p
          className="text-white text-base"
          style={{ fontFamily: "'Amiri', serif" }}
        >
          الكعبة المشرفة
        </p>
        <p className="text-white/40 text-[10px] font-sans mt-1">
          الوجهة النهائية للرحلة
        </p>
      </div>

      {/* Lock overlay */}
      {!unlocked && (
        <div className="bg-[#F5F0E8]/90 flex flex-col items-center justify-center py-5 gap-2 border-t border-gold/20">
          <Lock size={28} className="text-primary/30" />
          <p className="text-xs font-sans text-primary/50 text-center">
            أكمل العشر أيام لتفتح هذه المرحلة
          </p>
        </div>
      )}

      {unlocked && (
        <div className="bg-amber-50 flex flex-col items-center justify-center py-4 gap-1 border-t border-gold/20">
          <Award size={24} className="text-gold" />
          <p className="text-xs font-sans text-gold font-medium">
            وصلت! بارك الله فيك
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

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

  const unlockedDays = getUnlockedDays();

  // تحميل التحديات
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

  // تحميل الإكمالات
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

  // تبديل المهمة
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
        await deleteDoc(taskRef);
        setCompletions((prev) => {
          const next = { ...prev };
          delete next[taskId];
          return next;
        });
        if (appUser) {
          await updateDoc(doc(db, "users", user.uid), {
            points: Math.max(0, (appUser.points || 0) - task.points),
          });
        }
        showToast("تم إلغاء إكمال المهمة", "info");
      } else {
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
        if (appUser) {
          await updateDoc(doc(db, "users", user.uid), {
            points: (appUser.points || 0) + task.points,
          });
        }
        showToast(`تم إكمال المهمة — +${task.points} نقطة`);
      }
    } catch {
      showToast("حدث خطأ، حاول مرة أخرى", "error");
    } finally {
      setTogglingTask(null);
    }
  };

  // إحصائيات
  const totalPoints = Object.values(completions).reduce(
    (sum, c) => sum + (c.points || 0),
    0,
  );
  const totalCompleted = Object.keys(completions).length;
  const totalTasks = days.reduce((sum, d) => sum + d.tasks.length, 0);
  const overallProgress =
    totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;
  const allComplete = totalTasks > 0 && totalCompleted === totalTasks;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <Loader2 size={36} className="text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-primary" dir="rtl">
      <Image src={Banner} alt="banner" className="aspect-ratio[2/1]" />

      {/* ── Stats ── */}
      {user && (
        <div className="flex gap-2 px-4 py-3 bg-white border-b border-primary/8">
          {[
            { val: totalPoints, lbl: "نقطة" },
            { val: totalCompleted, lbl: "مهمة" },
            { val: unlockedDays, lbl: "يوم مفتوح" },
            { val: CHALLENGE_DURATION_DAYS, lbl: "يوم" },
          ].map((s) => (
            <div
              key={s.lbl}
              className="flex-1 text-center bg-[#F5F0E8] rounded-2xl py-2 border border-primary/8"
            >
              <div className="text-base font-bold text-gold leading-none">
                {s.val}
              </div>
              <div className="text-[9px] font-sans text-primary/50 mt-0.5">
                {s.lbl}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Progress bar ── */}
      {user && (
        <div className="px-4 py-3 bg-white border-b border-primary/8">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <TrendingUp size={14} className="text-gold" />
              <span className="text-xs font-sans text-primary/60">
                نحو الكعبة
              </span>
            </div>
            <span className="text-xs font-sans text-gold font-medium">
              {Math.round(overallProgress)}%
            </span>
          </div>
          <div className="h-2 bg-primary/8 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all duration-700"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] font-sans text-primary/30 flex items-center gap-1">
              <Calendar size={10} />
              الأيام المفتوحة: {unlockedDays} من {CHALLENGE_DURATION_DAYS}
            </span>
            <span className="text-[10px] font-sans text-gold">
              {totalPoints} نقطة
            </span>
          </div>
        </div>
      )}

      {/* ── Login prompt ── */}
      {!user && (
        <div className="mx-4 mt-6 bg-white rounded-2xl border border-primary/10 p-6 text-center">
          <MapPin size={28} className="text-gold mx-auto mb-3" />
          <p className="text-sm font-sans text-primary/60 mb-4">
            سجّل دخولك للمشاركة في الرحلة وتتبع تقدمك
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => router.push("/auth/login")}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl border border-gold/30 text-gold text-sm font-sans hover:bg-gold/8 transition-all"
            >
              <LogIn size={14} />
              تسجيل الدخول
            </button>
            <button
              onClick={() => router.push("/auth/register")}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gold text-white text-sm font-sans hover:bg-gold-light transition-all"
            >
              <UserPlus size={14} />
              حساب جديد
            </button>
          </div>
        </div>
      )}

      {/* ── Journey map ── */}
      <div className="px-4 py-6 space-y-3 relative">
        {/* Vertical dotted spine */}
        <div
          className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, #C8A870 0, #C8A870 8px, transparent 8px, transparent 16px)",
          }}
        />

        {days.map((day, idx) => {
          const unlocked = day.id <= unlockedDays;
          const doneTasks = day.tasks.filter((t) => completions[t.id]).length;
          const allDone = unlocked && doneTasks === day.tasks.length;
          const isCurrent = day.id === unlockedDays && !allDone;
          const isExpanded = expandedDay === day.id;
          const isRight = idx % 2 === 0;

          const handleToggle = () => {
            if (!unlocked) {
              showToast("هذا اليوم لم يفتح بعد", "info");
              return;
            }
            if (!user) {
              router.push("/auth/login");
              return;
            }
            setExpandedDay(isExpanded ? null : day.id);
          };

          return (
            <div key={day.id} className="relative z-10">
              {/* Stage row */}
              <div
                className={`flex items-center gap-2.5 ${
                  isRight ? "flex-row-reverse pr-1" : "flex-row pl-1"
                }`}
              >
                <StageNode
                  day={day}
                  unlocked={unlocked}
                  allDone={allDone}
                  isCurrent={isCurrent}
                  onClick={handleToggle}
                />

                <div className={`flex-1 max-w-[200px] ${isRight ? "" : ""}`}>
                  <StageCard
                    day={day}
                    unlocked={unlocked}
                    doneTasks={doneTasks}
                    isOpen={isExpanded}
                    isCurrent={isCurrent}
                    onClick={handleToggle}
                  />
                </div>
              </div>

              {/* Tasks drawer */}
              {isExpanded && unlocked && (
                <div className="mt-2 mb-1 pr-4 border-r-2 border-gold/20 space-y-1.5 animate-fade-in-up">
                  <div className="flex items-center justify-between px-2 py-1">
                    <span className="text-[10px] font-sans font-medium text-primary/40">
                      المهام
                    </span>
                    <span className="text-[10px] font-sans text-gold/60">
                      مجموع النقاط:{" "}
                      {day.tasks.reduce((s, t) => s + t.points, 0)}
                    </span>
                  </div>
                  {day.tasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      completed={!!completions[task.id]}
                      toggling={togglingTask === task.id}
                      onToggle={toggleTask}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Kaaba destination ── */}
      <KaabaDestination unlocked={allComplete} />

      <div
        className="py-8 text-center text-gold/30 text-xl"
        style={{ fontFamily: "'Amiri', serif" }}
      >
        ✦ ✧ ✦
      </div>
    </div>
  );
}
