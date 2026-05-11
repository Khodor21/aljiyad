import {
  Footprints,
  Heart,
  Flame,
  Compass,
  Zap,
  Star,
  Target,
  Award,
  Crown,
  Trophy,
} from "lucide-react";

const iconMap: Record<string, any> = {
  footprints: Footprints,
  heart: Heart,
  flame: Flame,
  compass: Compass,
  zap: Zap,
  star: Star,
  target: Target,
  award: Award,
  crown: Crown,
  trophy: Trophy,
};

interface BadgeDisplayProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}

export default function BadgeDisplay({
  id,
  name,
  description,
  icon,
  earned,
}: BadgeDisplayProps) {
  const Icon = iconMap[icon] || Star;

  return (
    <div
      className={`flex flex-col items-center text-center p-4 rounded-xl transition-all duration-300 ${
        earned
          ? "bg-gold/10 border border-gold/30"
          : "bg-white/[0.02] border border-white/5 opacity-35"
      }`}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
          earned ? "gold-gradient" : "bg-white/5"
        }`}
      >
        <Icon size={22} className={earned ? "text-white" : "text-white/30"} />
      </div>
      <span
        className={`text-xs font-bold ${earned ? "text-gold-light" : "text-white/40"}`}
      >
        {name}
      </span>
      <span className="text-[10px] text-white/30 mt-1 leading-relaxed">
        {description}
      </span>
    </div>
  );
}
