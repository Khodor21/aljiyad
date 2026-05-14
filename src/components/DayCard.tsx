"use client";

import {
  Heart,
  Clock,
  Sun,
  BookOpen,
  Repeat,
  Gift,
  Users,
  Mountain,
  Star,
  Trophy,
  Lock,
  Check,
  ChevronDown,
} from "lucide-react";

const iconMap: Record<string, any> = {
  heart: Heart,
  clock: Clock,
  sun: Sun,
  "book-open": BookOpen,
  repeat: Repeat,
  gift: Gift,
  users: Users,
  mountain: Mountain,
  star: Star,
  trophy: Trophy,
};

interface DayCardProps {
  day: {
    id: number;
    title: string;
    description: string;
    icon: string;
    tasks: { id: string; name: string; points: number }[];
  };
  unlocked: boolean;
  completedTasks: number;
  totalTasks: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function DayCard({
  day,
  unlocked,
  completedTasks,
  totalTasks,
  isExpanded,
  onToggle,
}: DayCardProps) {
  const Icon = iconMap[day.icon] || Star;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const isComplete = completedTasks === totalTasks && totalTasks > 0;

  return (
    <button
      onClick={onToggle}
      disabled={!unlocked}
      className={`w-full text-right card p-5 transition-all duration-300 ${
        !unlocked
          ? "opacity-40 cursor-not-allowed"
          : isComplete
            ? "border-gold/40 bg-gold/5"
            : isExpanded
              ? "border-gold/30 bg-gold/5"
              : "hover:border-gold/25 hover:bg-primary/[0.03]"
      } ${isComplete ? "animate-pulse-gold" : ""}`}
    >
      {/* الرأس */}
      <div className="flex items-center gap-4">
        {/* رقم اليوم + أيقونة */}
        <div
          className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
            isComplete
              ? "gold-gradient text-white text-primary"
              : unlocked
                ? "bg-gold/15 text-gold-light"
                : "bg-primary/5 text-primary/30"
          }`}
        >
          {!unlocked ? (
            <Lock size={18} />
          ) : isComplete ? (
            <Check size={20} />
          ) : (
            <Icon size={20} />
          )}
          <span className="text-[10px] font-bold mt-0.5">
            {unlocked ? `يوم ${day.id}` : "مقفل"}
          </span>
        </div>

        {/* العنوان والوصف */}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-bold text-base ${
              unlocked ? "text-primary" : "text-primary/40"
            }`}
          >
            {day.title}
          </h3>
          <p className="text-xs text-primary/40 mt-0.5 truncate">
            {unlocked ? day.description : `يفتح بعد ${day.id - 1} أيام`}
          </p>
        </div>

        {/* النقاط والسهم */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {unlocked && (
            <span className="text-xs font-bold text-gold-light">
              {completedTasks}/{totalTasks}
            </span>
          )}
          <ChevronDown
            size={18}
            className={`text-primary/30 transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* شريط التقدم */}
      {unlocked && (
        <div className="mt-4 h-1.5 bg-primary/5 rounded-full overflow-hidden">
          <div
            className="progress-bar h-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </button>
  );
}
