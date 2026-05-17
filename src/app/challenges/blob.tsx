"use client";
import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Check,
  Star,
  TrendingUp,
  Lock,
  Loader2,
  BookMarked,
  FileText,
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
import type { LucideIcon } from "lucide-react";
import TasbihModal from "./TasbihModal";
import defaultChallenges from "../../lib/challenges.json";

// ── Types ──────────────────────────────────────────────────────────────────
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
  description?: string;
  icon: string;
  tasks: Task[];
}

// ── Config ─────────────────────────────────────────────────────────────────
const CHALLENGE_START_DATE = new Date("2025-05-27T00:00:00");
const CHALLENGE_DURATION_DAYS = 10;

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

const getUnlockedDays = (): number => {
  try {
    const now = new Date();
    const diffMs = now.getTime() - CHALLENGE_START_DATE.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const result = Math.min(Math.max(diffDays + 1, 1), CHALLENGE_DURATION_DAYS);
    return isNaN(result) ? 1 : result;
  } catch {
    return 1;
  }
};

// ── PDF Helper ─────────────────────────────────────────────────────────────
// Best practice: open the actual PDF file directly in a new tab.
// If you host PDFs at /pdfs/day-N.pdf they will open as native PDF.
const openPdf = (task: Task) => {
  // If task has a direct URL, use it; otherwise derive from pdfDay
  const url = task.pdfUrl || `/pdfs/day-${task.pdfDay}.pdf`;
  window.open(url, "_blank", "noopener,noreferrer");
};

// ── Tasbih Button (مسبحة) ─────────────────────────────────────────────────
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
        {/* Beads icon as inline SVG since lucide may not have it */}
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

// ── Task Row ───────────────────────────────────────────────────────────────
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

  return (
    <div className="relative">
      <button
        onClick={() => onToggle(task.id)}
        disabled={toggling}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-right transition-all duration-150
          ${
            completed
              ? "bg-amber-50 border-amber-200/60"
              : "bg-white border-stone-200 hover:border-amber-300 hover:bg-amber-50/40"
          }
          ${toggling ? "opacity-60 cursor-wait" : "cursor-pointer"}
        `}
      >
        {/* Checkbox */}
        <div
          className={`
            w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
            ${completed ? "bg-amber-500 border-amber-500" : "border-amber-400/60 bg-white"}
          `}
        >
          {completed && (
            <Check size={13} className="text-white" strokeWidth={2.5} />
          )}
          {toggling && !completed && (
            <Loader2 size={12} className="animate-spin text-amber-500" />
          )}
        </div>

        {/* Task name */}
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

        <span className="text-[10px] text-amber-600 font-medium flex-shrink-0">
          +{task.points}
        </span>
      </button>

      {/* PDF open button for book type */}
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

      {/* Tasbih button for estighfar type */}
      {isEstighfar && <TasbihButton task={task} />}
    </div>
  );
}

// ── Day Card ───────────────────────────────────────────────────────────────
function DayCard({
  day,
  unlocked,
  doneTasks,
  isCurrent,
  isDone,
  isLast,
  onClick,
}: {
  day: DayData;
  unlocked: boolean;
  doneTasks: number;
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
          className={`
            w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all
            ${
              isDone
                ? "bg-amber-500 border-amber-500"
                : isCurrent
                  ? "bg-white border-amber-500"
                  : "bg-stone-100 border-stone-200"
            }
          `}
          style={
            isCurrent ? { boxShadow: "0 0 0 4px rgba(217,119,6,0.15)" } : {}
          }
        >
          {isDone ? (
            <Check size={18} className="text-white" strokeWidth={2.5} />
          ) : locked ? (
            <Lock size={15} className="text-stone-400" />
          ) : (
            <Icon
              size={17}
              className={isCurrent ? "text-amber-500" : "text-stone-400"}
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
          className={`
            w-full text-right rounded-2xl border transition-all duration-200
            ${
              locked
                ? "bg-stone-50 border-stone-100 opacity-50 cursor-default"
                : isDone
                  ? "bg-white border-stone-200 hover:border-amber-200"
                  : isCurrent
                    ? "bg-white border-amber-400 border-2 shadow-amber-100 shadow-lg"
                    : "bg-white border-stone-200 hover:border-amber-200"
            }
          `}
        >
          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                    isDone
                      ? "bg-amber-100 text-amber-700"
                      : isCurrent
                        ? "bg-amber-500 text-white"
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
                <span className="text-[10px] text-amber-600 font-medium flex items-center gap-1 flex-shrink-0">
                  <CheckCircle2 size={11} />
                  مكتمل
                </span>
              )}
              {isCurrent && (
                <span className="text-[10px] text-amber-600 font-medium flex-shrink-0 flex items-center gap-1">
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

            {day.description && unlocked && (
              <p className="text-[11px] text-stone-400 mt-1 leading-snug">
                {day.description}
              </p>
            )}

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

// ── Kaaba Destination ──────────────────────────────────────────────────────
function KaabaDestination({ unlocked }: { unlocked: boolean }) {
  return (
    <div className="mx-4 mt-2 mb-6 rounded-2xl overflow-hidden border border-stone-200">
      <div className="bg-stone-800 relative flex flex-col items-center py-8 px-4">
        {/* Simple Kaaba shape */}
        <div className="relative w-14 h-16 mb-3">
          <div className="w-14 h-16 bg-stone-900 rounded border-2 border-amber-500/60 flex flex-col items-center justify-end overflow-hidden">
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
          <Award size={22} className="text-amber-500" />
          <p className="text-xs text-amber-700 font-medium">
            وصلت! بارك الله فيك
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const days: DayData[] = defaultChallenges as DayData[];
  const [completions, setCompletions] = useState<Record<string, boolean>>(
    () => {
      try {
        const saved = localStorage.getItem("challenge_completions");
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    },
  );
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [togglingTask, setTogglingTask] = useState<string | null>(null);

  const unlockedDays = getUnlockedDays();

  // Persist completions
  useEffect(() => {
    localStorage.setItem("challenge_completions", JSON.stringify(completions));
  }, [completions]);

  const toggleTask = async (taskId: string) => {
    if (togglingTask) return;
    setTogglingTask(taskId);
    // Simulate async save
    await new Promise((r) => setTimeout(r, 150));
    setCompletions((prev) => {
      const next = { ...prev };
      if (next[taskId]) {
        delete next[taskId];
      } else {
        next[taskId] = true;
      }
      return next;
    });
    setTogglingTask(null);
  };

  const totalTasks = days.reduce((sum, d) => sum + d.tasks.length, 0);
  const totalCompleted = Object.keys(completions).length;
  const totalPoints = days
    .flatMap((d) => d.tasks)
    .filter((t) => completions[t.id])
    .reduce((sum, t) => sum + t.points, 0);
  const overallProgress =
    totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;
  const doneDays = days.filter(
    (d) => d.id <= unlockedDays && d.tasks.every((t) => completions[t.id]),
  ).length;
  const allComplete = totalTasks > 0 && totalCompleted === totalTasks;

  return (
    <div
      className="min-h-screen bg-white text-stone-800 max-w-lg mx-auto"
      dir="rtl"
      style={{ fontFamily: "'Segoe UI', 'Tahoma', sans-serif" }}
    >
      <style>{`
        @keyframes pulseRing {
          0%, 100% { box-shadow: 0 0 0 0 rgba(217,119,6,0.3); }
          50% { box-shadow: 0 0 0 8px rgba(217,119,6,0); }
        }
      `}</style>

      {/* Header Banner */}
      <div className="w-full bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 px-6 pt-10 pb-8 text-center relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-amber-500/10" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-amber-500/10" />

        <div className="relative z-10">
          <div className="text-amber-400 text-2xl mb-2 tracking-widest">
            ✦ ✧ ✦
          </div>
          <h1 className="text-white text-2xl font-bold leading-snug">
            تحديات العشر
          </h1>
          <p className="text-amber-300/80 text-sm mt-1">
            العشر المباركة من ذي الحجة
          </p>
        </div>
      </div>

      {/* Dashboard */}
      <div className="bg-white border-b border-stone-100">
        <div className="grid grid-cols-3 gap-0 divide-x divide-x-reverse divide-stone-100">
          <div className="py-4 px-3 text-center">
            <div className="text-2xl font-bold text-amber-600 leading-none">
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
            <span className="text-[11px] font-medium text-amber-600">
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

      {/* Legend */}
      <div className="px-4 pt-3 pb-1 flex items-center gap-4 text-[10px] text-stone-400">
        <span className="flex items-center gap-1">
          <BookMarked size={10} className="text-amber-500" />
          مادة تعليمية (PDF)
        </span>
        <span className="flex items-center gap-1">
          <span>📿</span>
          استغفار (مسبحة)
        </span>
      </div>

      {/* Journey timeline */}
      <div className="px-4 pt-4 pb-2">
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
              if (!unlocked) return;
              setExpandedDay(isExpanded ? null : day.id);
            };

            return (
              <div key={day.id}>
                <DayCard
                  day={day}
                  unlocked={unlocked}
                  doneTasks={doneTasks}
                  isCurrent={isCurrent}
                  isDone={isDone}
                  isFirst={idx === 0}
                  isLast={idx === days.length - 1}
                  onClick={handleToggle}
                />

                {/* Tasks drawer */}
                {isExpanded && unlocked && (
                  <div
                    className="mb-3 pr-3 space-y-1.5"
                    style={{ marginRight: "52px" }}
                  >
                    <div className="flex items-center justify-between px-1 py-1 mb-2">
                      <span className="text-[10px] text-stone-400">
                        المهام اليومية
                      </span>
                      <span className="text-[10px] text-amber-600">
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
