"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import Banner from "../../public/Banner.png";
import Image from "next/image";
import { db } from "@/lib/firebase";
import TasbihModal from "./TasbihModal";

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

import type { LucideIcon } from "lucide-react";
import {
  FileText,
  Loader2,
  Lock,
  CheckCircle2,
  Check,
  Star,
  MapPin,
  TrendingUp,
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
  BookMarked,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Task {
  id: string;
  name: string;
  points: number;
  type?: string;
  pdfDay?: number;
  pdfUrl?: string;
}

interface DayData {
  id: number;
  title: string;
  description: string;
  icon: string;
  tasks: Task[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_META: Record<number, { env: string; Icon: LucideIcon }> = {
  1: { env: "1 ذو الحجة", Icon: Sunrise },
  2: { env: "ذو الحجة 2", Icon: Star },
  3: { env: "ذو الحجة 3", Icon: BookOpen },
  4: { env: "ذو الحجة 4", Icon: Heart },
  5: { env: "ذو الحجة 5", Icon: Leaf },
  6: { env: "ذو الحجة 6", Icon: Gem },
  7: { env: "7 ذو الحجة", Icon: Flame },
  8: { env: "ذو الحجة 8", Icon: Mountain },
  9: { env: "ذو الحجة 9", Icon: Bird },
  10: { env: "ذو الحجة 10", Icon: Moon },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getUnlockedDays = (): number => {
  try {
    const now = new Date();
    const start = CHALLENGE_START_DATE;
    if (!start || isNaN(start.getTime())) return 1;
    const diffMs = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const result = Math.min(Math.max(diffDays + 1, 1), CHALLENGE_DURATION_DAYS);
    return isNaN(result) ? 1 : result;
  } catch {
    return 1;
  }
};

// ─── Eid Modal ────────────────────────────────────────────────────────────────

function EidModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        background: "rgba(0,0,0,0.6)",
      }}
    >
      <div
        dir="rtl"
        style={{
          background: "#2a1400",
          border: "1px solid rgba(212,160,60,0.45)",
          borderRadius: "24px",
          padding: "32px 28px 28px",
          maxWidth: "340px",
          width: "100%",
          textAlign: "center",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* SVG Sheep Illustration */}
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <svg
            width="200"
            height="110"
            viewBox="0 0 200 110"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Shadow */}
            <ellipse
              cx="100"
              cy="82"
              rx="90"
              ry="10"
              fill="#1a0a00"
              opacity="0.5"
            />

            {/* Legs */}
            <rect x="68" y="78" width="8" height="18" rx="3" fill="#5a3a1a" />
            <rect x="84" y="78" width="8" height="18" rx="3" fill="#5a3a1a" />
            <rect x="108" y="78" width="8" height="18" rx="3" fill="#5a3a1a" />
            <rect x="124" y="78" width="8" height="18" rx="3" fill="#5a3a1a" />

            {/* Body wool */}
            <ellipse cx="100" cy="68" rx="40" ry="26" fill="#e8d5b0" />
            <ellipse cx="100" cy="62" rx="38" ry="22" fill="#f0e0c0" />
            <ellipse cx="85" cy="58" rx="12" ry="10" fill="#f0e0c0" />
            <ellipse cx="115" cy="58" rx="12" ry="10" fill="#f0e0c0" />
            <ellipse cx="100" cy="52" rx="14" ry="11" fill="#f0e0c0" />

            {/* Neck + Head */}
            <ellipse cx="130" cy="60" rx="22" ry="18" fill="#f0e0c0" />
            <ellipse cx="130" cy="44" rx="16" ry="14" fill="#f5ead5" />
            <ellipse cx="130" cy="44" rx="14" ry="12" fill="#f5ead5" />

            {/* Ears */}
            <ellipse cx="122" cy="40" rx="6" ry="8" fill="#f5ead5" />
            <ellipse cx="138" cy="40" rx="6" ry="8" fill="#f5ead5" />

            {/* Horns */}
            <path
              d="M119 33 Q122 24 118 20"
              stroke="#8B6914"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M141 33 Q138 24 142 20"
              stroke="#8B6914"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="117" cy="19" r="3" fill="#8B6914" />
            <circle cx="143" cy="19" r="3" fill="#8B6914" />

            {/* Eyes */}
            <ellipse cx="127" cy="49" rx="3" ry="2" fill="#1a0a00" />
            <ellipse cx="134" cy="49" rx="3" ry="2" fill="#1a0a00" />
            <ellipse cx="127" cy="49" rx="1.5" ry="1.5" fill="#3a2010" />
            <ellipse cx="134" cy="49" rx="1.5" ry="1.5" fill="#3a2010" />

            {/* Nose + mouth */}
            <ellipse cx="130" cy="54" rx="4" ry="2.5" fill="#d4a0a0" />
            <path d="M126 54 Q130 58 134 54" fill="#c08080" />

            {/* Tail */}
            <path
              d="M62 68 Q52 60 56 72"
              stroke="#e8d5b0"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />

            {/* Collar badge */}
            <rect x="86" y="58" width="28" height="18" rx="6" fill="#d4a03c" />
            <text
              x="100"
              y="71"
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill="#5a3000"
              fontFamily="sans-serif"
            >
              عيد
            </text>
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "26px",
            fontWeight: "700",
            color: "#f0c855",
            lineHeight: "1.4",
            marginBottom: "6px",
          }}
        >
          عيد الأضحى مبارك
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "16px",
            color: "rgba(240,200,120,0.8)",
            marginBottom: "18px",
          }}
        >
          تقبّل الله منّا ومنكم صالح الأعمال
        </div>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "0.5px",
              background: "rgba(212,160,60,0.35)",
            }}
          />
          <div
            style={{
              width: "6px",
              height: "6px",
              background: "#d4a03c",
              transform: "rotate(45deg)",
              borderRadius: "1px",
              flexShrink: 0,
            }}
          />
          <div
            style={{
              flex: 1,
              height: "0.5px",
              background: "rgba(212,160,60,0.35)",
            }}
          />
        </div>

        {/* Message */}
        <div
          style={{
            fontSize: "16px",
            color: "rgba(255,235,185,0.88)",
            lineHeight: "2",
            marginBottom: "20px",
          }}
        >
          كل عام وأنتم بخير وعافية
          <br />
          أعاده الله علينا وعليكم
          <br />
          بالسعادة والرحمة والمغفرة
        </div>

        {/* Ornament */}
        <div
          style={{
            color: "rgba(212,160,60,0.5)",
            letterSpacing: "8px",
            fontSize: "14px",
            marginBottom: "20px",
          }}
        >
          ✦ ✧ ✦
        </div>
      </div>
    </div>
  );
}

// ─── Task Row ─────────────────────────────────────────────────────────────────

function TasbihButton({ task }: { task: Task }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="mt-1 mr-9 flex items-center gap-1.5 text-[11px] text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-300 transition-all duration-150 px-2.5 py-1 rounded-full w-fit font-medium"
      >
        <span className="text-base leading-none">📿</span>
        <span>افتح المسبحة</span>
      </button>
      <TasbihModal
        isOpen={open}
        onClose={() => setOpen(false)}
        taskName={task.name}
      />
    </>
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
  const isBook = task.type === "book";
  const isEstighfar = task.type === "estighfar";

  const openPdf = (t: Task) => {
    const url = t.pdfUrl || `/pdfs/day-${t.pdfDay}.pdf`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="relative">
      <button
        onClick={() => onToggle(task.id)}
        disabled={toggling}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-right transition-all duration-150
          ${completed ? "bg-amber-50 border-amber-200/60" : "bg-white border-stone-200 hover:border-amber-300 hover:bg-amber-50/40"}
          ${toggling ? "opacity-60 cursor-wait" : "cursor-pointer"}
        `}
      >
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
            ${completed ? "bg-gold border-gold" : "border-amber-400/60 bg-white"}`}
        >
          {completed && (
            <Check size={13} className="text-white" strokeWidth={2.5} />
          )}
          {toggling && !completed && (
            <Loader2 size={12} className="animate-spin text-gold" />
          )}
        </div>

        <span
          className={`flex-1 text-xs leading-snug text-right flex items-center gap-1.5 ${
            completed
              ? "text-amber-700 line-through decoration-amber-400/50"
              : "text-stone-700"
          }`}
        >
          {isBook && (
            <BookMarked
              size={12}
              className={`flex-shrink-0 ${completed ? "text-amber-400" : "text-amber-500"}`}
            />
          )}
          {isEstighfar && (
            <span className="flex-shrink-0 text-emerald-500 text-[11px]">
              📿
            </span>
          )}
          {task.name}
        </span>

        <span className="text-[10px] text-gold font-medium flex-shrink-0">
          +{task.points}
        </span>
      </button>

      {isBook && task.pdfDay && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            openPdf(task);
          }}
          className="mt-1 mr-9 flex items-center gap-1.5 text-[11px] text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 hover:border-amber-300 transition-all duration-150 px-2.5 py-1 rounded-full w-fit font-medium"
        >
          <FileText size={11} />
          <span>افتح الكتاب — اليوم {task.pdfDay}</span>
        </button>
      )}

      {isEstighfar && <TasbihButton task={task} />}
    </div>
  );
}

// ─── Day Card ─────────────────────────────────────────────────────────────────

function DayCard({
  day,
  unlocked,
  doneTasks,
  isOpen,
  isCurrent,
  isDone,
  isFirst,
  isLast,
  onClick,
}: {
  day: DayData;
  unlocked: boolean;
  doneTasks: number;
  isOpen: boolean;
  isCurrent: boolean;
  isDone: boolean;
  isFirst: boolean;
  isLast: boolean;
  onClick: () => void;
}) {
  const meta = DAY_META[day.id] ?? { env: "", Icon: Star };
  const { Icon } = meta;
  const locked = !unlocked;

  return (
    <div className="flex gap-3 items-start">
      {/* Timeline column */}
      <div className="flex flex-col items-center flex-shrink-0 w-10">
        <div
          className={`w-px flex-shrink-0 h-3 ${isDone ? "bg-amber-400" : "bg-stone-200"}`}
        />

        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all
            ${
              isDone
                ? "bg-gold border-gold"
                : isCurrent
                  ? "bg-white border-amber-500 shadow-[0_0_0_4px_rgba(217,119,6,0.12)]"
                  : "bg-stone-100 border-stone-200"
            }`}
          style={
            isCurrent ? { animation: "pulseRing 2s ease-in-out infinite" } : {}
          }
        >
          {isDone ? (
            <Check size={18} className="text-white" strokeWidth={2.5} />
          ) : locked ? (
            <Lock size={15} className="text-stone-400" />
          ) : (
            <Icon
              size={17}
              className={isCurrent ? "text-gold" : "text-stone-400"}
            />
          )}
        </div>

        {!isLast && (
          <div
            className={`w-px flex-1 min-h-[20px] ${isDone ? "bg-amber-400" : "bg-stone-200"}`}
          />
        )}
      </div>

      {/* Card */}
      <div className="flex-1 pb-3">
        <button
          onClick={onClick}
          disabled={locked}
          className={`w-full text-right rounded-2xl border transition-all duration-200
            ${
              locked
                ? "bg-stone-50 border-stone-100 opacity-50 cursor-default"
                : isDone
                  ? "bg-white border-stone-200 hover:border-amber-200"
                  : isCurrent
                    ? "bg-white border-amber-400 border-2 shadow-[0_4px_24px_rgba(217,119,6,0.12)]"
                    : "bg-white border-stone-200 hover:border-amber-200"
            }`}
        >
          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0
                    ${
                      isDone
                        ? "bg-amber-100 text-amber-700"
                        : isCurrent
                          ? "bg-gold text-white"
                          : "bg-stone-100 text-stone-400"
                    }`}
                >
                  يوم {day.id}
                </span>
                {!locked && (
                  <span className="text-[10px] text-stone-400 truncate">
                    {meta.env}
                  </span>
                )}
              </div>

              {isDone && (
                <span className="text-[10px] text-gold font-medium flex items-center gap-1 flex-shrink-0">
                  <CheckCircle2 size={11} />
                  مكتمل
                </span>
              )}
              {isCurrent && (
                <span className="text-[10px] text-gold font-medium flex-shrink-0 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse" />
                  أنت هنا
                </span>
              )}
              {locked && (
                <span className="text-[10px] text-stone-300 flex-shrink-0">
                  مقفل
                </span>
              )}
            </div>

            <p
              className={`mt-2 text-sm leading-relaxed font-medium ${
                isCurrent
                  ? "text-stone-800 text-base"
                  : isDone
                    ? "text-stone-500"
                    : "text-stone-400"
              }`}
            >
              {day.title}
            </p>

            {unlocked && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${day.tasks.length > 0 ? (doneTasks / day.tasks.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-stone-400 flex-shrink-0">
                  {doneTasks}/{day.tasks.length}
                </span>
              </div>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── Kaaba Destination ────────────────────────────────────────────────────────

function KaabaDestination({ unlocked }: { unlocked: boolean }) {
  return (
    <div className="mx-4 mt-2 mb-6 rounded-2xl overflow-hidden border border-stone-200">
      <div className="bg-stone-800 relative flex flex-col items-center py-8 px-4">
        <div className="relative w-14 h-18 mb-3">
          <div className="w-14 h-18 bg-stone-900 rounded border-2 border-amber-500/60 flex flex-col items-center justify-end pb-0 overflow-hidden">
            <div className="absolute top-5 left-0 right-0 h-2.5 bg-amber-500/70" />
            <div className="w-4 h-6 bg-amber-500/60 rounded-t mb-0" />
          </div>
        </div>
        <p className="text-white text-sm font-medium mt-1">الكعبة المشرفة</p>
        <p className="text-white/40 text-[10px] mt-0.5">
          الوجهة النهائية للرحلة
        </p>
      </div>

      {!unlocked ? (
        <div className="bg-stone-50 flex flex-col items-center justify-center py-5 gap-2 border-t border-stone-200">
          <Lock size={24} className="text-stone-300" />
          <p className="text-xs text-stone-400 text-center">
            أكمل العشر أيام لتفتح هذه المرحلة
          </p>
        </div>
      ) : (
        <div className="bg-amber-50 flex flex-col items-center justify-center py-4 gap-1 border-t border-amber-200">
          <Award size={22} className="text-gold" />
          <p className="text-xs text-amber-700 font-medium">
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
  const [showEidModal, setShowEidModal] = useState(false);

  const unlockedDays = getUnlockedDays();

  // Show Eid modal once per session
  useEffect(() => {
    const seen = sessionStorage.getItem("eid-adha-modal-seen");
    if (!seen) {
      setShowEidModal(true);
      sessionStorage.setItem("eid-adha-modal-seen", "1");
    }
  }, []);

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

  const toggleTask = async (taskId: string) => {
    if (!user || togglingTask) return;
    setTogglingTask(taskId);
    try {
      const taskRef = doc(db, "completions", user.uid, "tasks", taskId);
      const dayId = parseInt(taskId.split("_")[0]);
      const day = days.find((d) => d.id === dayId);
      const task = day?.tasks.find((t) => t.id === taskId);
      if (!task) return;
      const taskPoints = task.points;

      if (completions[taskId]) {
        await deleteDoc(taskRef);
        setCompletions((prev) => {
          const next = { ...prev };
          delete next[taskId];
          return next;
        });
        if (appUser) {
          await updateDoc(doc(db, "users", user.uid), {
            points: Math.max(0, (appUser.points || 0) - taskPoints),
          });
          appUser.points = Math.max(0, (appUser.points || 0) - taskPoints);
        }
        showToast("تم إلغاء إكمال المهمة", "info");
      } else {
        await setDoc(taskRef, {
          completed: true,
          completedAt: serverTimestamp(),
          points: taskPoints,
        });
        setCompletions((prev) => ({
          ...prev,
          [taskId]: {
            completed: true,
            completedAt: new Date(),
            points: taskPoints,
          },
        }));
        if (appUser) {
          await updateDoc(doc(db, "users", user.uid), {
            points: (appUser.points || 0) + taskPoints,
          });
          appUser.points = (appUser.points || 0) + taskPoints;
        }
        showToast(`تم إكمال المهمة — +${taskPoints} نقطة`);
      }
    } catch {
      showToast("حدث خطأ، حاول مرة أخرى", "error");
    } finally {
      setTogglingTask(null);
    }
  };

  const totalPoints = Object.values(completions).reduce(
    (sum, c) => sum + (c.points || 0),
    0,
  );
  const totalCompleted = Object.keys(completions).length;
  const totalTasks = days.reduce((sum, d) => sum + d.tasks.length, 0);
  const overallProgress =
    totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;
  const doneDays = days.filter(
    (d) =>
      d.id < unlockedDays ||
      (d.id === unlockedDays && d.tasks.every((t) => completions[t.id])),
  ).length;
  const allComplete = totalTasks > 0 && totalCompleted === totalTasks;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={32} className="text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-white text-stone-800"
      dir="rtl"
      style={{ fontFamily: "'Thmanyah Sans', sans-serif" }}
    >
      <style>{`
        @keyframes pulseRing {
          0%, 100% { box-shadow: 0 0 0 0 rgba(217,119,6,0.3); }
          50% { box-shadow: 0 0 0 8px rgba(217,119,6,0); }
        }
      `}</style>

      {/* Eid Modal */}
      {showEidModal && <EidModal onClose={() => setShowEidModal(false)} />}

      {/* Banner */}
      <Image src={Banner} alt="banner" className="w-full" />

      {/* Dashboard header */}
      {user && (
        <div className="bg-white border-b border-stone-100">
          <div className="grid grid-cols-3 gap-0 divide-x divide-x-reverse divide-stone-100">
            <div className="py-4 px-3 text-center">
              <div className="text-2xl font-bold text-gold leading-none">
                {totalPoints}
              </div>
              <div className="text-[10px] text-stone-400 mt-1">نقطة</div>
            </div>
            <div className="py-4 px-3 text-center">
              <div className="text-2xl font-bold text-stone-700 leading-none">
                {unlockedDays}
              </div>
              <div className="text-[10px] text-stone-400 mt-1">يوم مفتوح</div>
            </div>
            <div className="py-4 px-3 text-center">
              <div className="text-2xl font-bold text-stone-700 leading-none">
                {doneDays}
                <span className="text-base text-stone-300">
                  /{CHALLENGE_DURATION_DAYS}
                </span>
              </div>
              <div className="text-[10px] text-stone-400 mt-1">أيام مكتملة</div>
            </div>
          </div>

          <div className="px-4 pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={13} className="text-amber-500" />
                <span className="text-[11px] text-stone-500">
                  نحو الكعبة المشرفة
                </span>
              </div>
              <span className="text-[11px] font-medium text-gold">
                {Math.round(overallProgress)}%
              </span>
            </div>
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-700"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Login prompt */}
      {!user && (
        <div className="mx-4 mt-6 bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
          <MapPin size={26} className="text-amber-500 mx-auto mb-3" />
          <p className="text-sm text-stone-600 mb-4">
            سجّل دخولك للمشاركة في الرحلة وتتبع تقدمك
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => router.push("/auth/login")}
              className="flex items-center gap-1 px-6 py-2 rounded-xl border border-amber-300 text-amber-700 text-sm hover:bg-amber-100 transition-all"
            >
              <LogIn size={14} />
              تسجيل الدخول
            </button>
            <button
              onClick={() => router.push("/auth/register")}
              className="flex items-center gap-1 px-6 py-2 rounded-xl bg-gold text-white text-sm hover:bg-amber-700 transition-all"
            >
              <UserPlus size={14} />
              حساب جديد
            </button>
          </div>
        </div>
      )}

      {/* Journey timeline */}
      <div className="px-4 pt-6 pb-2">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xs font-medium text-stone-400 uppercase tracking-widest">
            تحديات العشر
          </span>
          <div className="flex-1 h-px bg-stone-100" />
        </div>

        <div>
          {days.map((day, idx) => {
            const unlocked = day.id <= unlockedDays;
            const doneTasks = day.tasks.filter((t) => completions[t.id]).length;
            const allDone = unlocked && doneTasks === day.tasks.length;
            const isCurrent = day.id === unlockedDays && !allDone;
            const isDone = unlocked && (day.id < unlockedDays || allDone);
            const isExpanded = expandedDay === day.id;

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
              <div key={day.id}>
                <DayCard
                  day={day}
                  unlocked={unlocked}
                  doneTasks={doneTasks}
                  isOpen={isExpanded}
                  isCurrent={isCurrent}
                  isDone={isDone}
                  isFirst={idx === 0}
                  isLast={idx === days.length - 1}
                  onClick={handleToggle}
                />

                {isExpanded && unlocked && (
                  <div className="mr-13 mb-3 pr-3 mr-[52px] space-y-1.5">
                    <div className="flex items-center justify-between px-1 py-1 mb-2">
                      <span className="text-[10px] text-stone-400">
                        المهام اليومية
                      </span>
                      <span className="text-[10px] text-gold">
                        {day.tasks.reduce((s, t) => s + t.points, 0)} نقطة
                        إجمالاً
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
      </div>

      {/* Kaaba destination */}
      <KaabaDestination unlocked={allComplete} />

      {/* Footer ornament */}
      <div className="py-6 text-center text-amber-300 text-lg tracking-widest">
        ✦ ✧ ✦
      </div>
    </div>
  );
}
