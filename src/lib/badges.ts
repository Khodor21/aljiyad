export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: BadgeStats) => boolean;
}

export interface BadgeStats {
  completedDays: number;
  totalPoints: number;
  fullyCompletedDays: number[];
  allCompletions: Record<string, boolean>;
}

export const badges: Badge[] = [
  {
    id: "first_step",
    name: "أول الخطوة",
    description: "أكمل مهمة واحدة على الأقل",
    icon: "footprints",
    condition: (s) => Object.keys(s.allCompletions).length > 0,
  },
  {
    id: "day_1_complete",
    name: "يوم التوبة",
    description: "أكمل جميع مهام اليوم الأول",
    icon: "heart",
    condition: (s) => s.fullyCompletedDays.includes(1),
  },
  {
    id: "three_days",
    name: "ثلاثة أيام",
    description: "أكمل مهام 3 أيام كاملة",
    icon: "flame",
    condition: (s) => s.fullyCompletedDays.length >= 3,
  },
  {
    id: "half_way",
    name: "نصف الطريق",
    description: "أكمل مهام 5 أيام كاملة",
    icon: "compass",
    condition: (s) => s.fullyCompletedDays.length >= 5,
  },
  {
    id: "almost_there",
    name: "قرب النهاية",
    description: "أكمل مهام 7 أيام كاملة",
    icon: "zap",
    condition: (s) => s.fullyCompletedDays.length >= 7,
  },
  {
    id: "arafah",
    name: "يوم عرفة",
    description: "أكمل جميع مهام يوم عرفة",
    icon: "star",
    condition: (s) => s.fullyCompletedDays.includes(9),
  },
  {
    id: "hundred_points",
    name: "المئوي",
    description: "اجمع 100 نقطة",
    icon: "target",
    condition: (s) => s.totalPoints >= 100,
  },
  {
    id: "five_hundred",
    name: "نصف الألف",
    description: "اجمع 500 نقطة",
    icon: "award",
    condition: (s) => s.totalPoints >= 500,
  },
  {
    id: "thousand",
    name: "الألفي",
    description: "اجمع 1000 نقطة",
    icon: "crown",
    condition: (s) => s.totalPoints >= 1000,
  },
  {
    id: "completer",
    name: "المُتمّم",
    description: "أكمل جميع مهام الأيام العشرة",
    icon: "trophy",
    condition: (s) => s.fullyCompletedDays.length >= 10,
  },
];

// حساب الأوسمة المستحقة
export function getEarnedBadges(stats: BadgeStats): Badge[] {
  return badges.filter((b) => b.condition(stats));
}
