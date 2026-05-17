"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import defaultChallenges from "@/lib/challenges.json";
import { badges as allBadges, getEarnedBadges, BadgeStats } from "@/lib/badges";
import BadgeDisplay from "@/components/BadgeDisplay";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  Loader2,
  Trophy,
  Medal,
  User,
  Award,
  TrendingUp,
  Crown,
  LogOut,
} from "lucide-react";

interface LeaderboardUser {
  uid: string;
  username: string;
  points: number;
}

// Build a flat map of taskId → points from the JSON for fast lookup
const TASK_POINTS_MAP: Record<string, number> = {};
(defaultChallenges as any[]).forEach((day) => {
  day.tasks.forEach((task: any) => {
    TASK_POINTS_MAP[task.id] = task.points;
  });
});

export default function ProfilePage() {
  const { user, appUser, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [completions, setCompletions] = useState<Record<string, boolean>>({});
  const [totalPoints, setTotalPoints] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const loadData = async () => {
      try {
        const compSnap = await getDocs(
          collection(db, "completions", user.uid, "tasks"),
        );

        const compMap: Record<string, boolean> = {};
        let computedPoints = 0;

        compSnap.forEach((d) => {
          compMap[d.id] = true;
          const jsonPoints = TASK_POINTS_MAP[d.id];
          const storedPoints = (d.data().points as number) || 0;
          computedPoints +=
            jsonPoints !== undefined ? jsonPoints : storedPoints;
        });

        setCompletions(compMap);
        setTotalPoints(computedPoints);

        const lbQuery = query(
          collection(db, "users"),
          orderBy("points", "desc"),
          limit(50),
        );

        const lbSnap = await getDocs(lbQuery);
        const lbList: LeaderboardUser[] = [];

        lbSnap.forEach((d) => {
          const data = d.data();
          lbList.push({
            uid: d.id,
            username: data.username,
            points: data.points || 0,
          });
        });

        setLeaderboard(lbList);

        const rank = lbList.findIndex((u) => u.uid === user.uid);
        setUserRank(rank >= 0 ? rank + 1 : null);
      } catch (err) {
        console.error("خطأ في تحميل البيانات:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const getStats = (): BadgeStats => {
    const fullyCompletedDays: number[] = [];

    (defaultChallenges as any[]).forEach((day) => {
      const allDone = day.tasks.every((t: any) => completions[t.id]);
      if (allDone) fullyCompletedDays.push(day.id);
    });

    return {
      completedDays: fullyCompletedDays.length,
      totalPoints,
      fullyCompletedDays,
      allCompletions: completions,
    };
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={40} className="text-gold animate-spin" />
      </div>
    );
  }

  if (!user || !appUser) return null;

  const stats = getStats();
  const earned = getEarnedBadges(stats);

  const topThreeIcons = [
    <Crown key="crown" size={14} className="text-yellow-500" />,
    <Medal key="medal-s" size={14} className="text-gray-400" />,
    <Medal key="medal-b" size={14} className="text-amber-600" />,
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-28 space-y-5">
        {/* بطاقة المستخدم */}
        <div className="relative bg-white border border-gray-100 rounded-2xl p-5 shadow-sm overflow-hidden animate-fade-in-up">
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gold flex items-center justify-center flex-shrink-0 shadow-md shadow-gold/20">
              <User size={24} className="text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-primary truncate">
                {appUser.username}
              </h2>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                <span>{appUser.phone}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span>{appUser.age} سنة</span>
              </div>
            </div>
          </div>

          {/* الإحصائيات */}
          <div className="relative grid grid-cols-3 gap-3 mt-5">
            <div className="bg-gold/[0.07] border border-gold/10 rounded-xl p-3 text-center">
              <TrendingUp size={16} className="text-gold mx-auto mb-1.5" />
              <div className="text-2xl font-black text-gold leading-none">
                {totalPoints}
              </div>
              <div className="text-[10px] text-gray-400 mt-1 font-medium">
                نقطة
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
              <Award size={16} className="text-primary/50 mx-auto mb-1.5" />
              <div className="text-2xl font-black text-primary leading-none">
                {earned.length}
              </div>
              <div className="text-[10px] text-gray-400 mt-1 font-medium">
                وسام
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
              <Medal size={16} className="text-primary/50 mx-auto mb-1.5" />
              <div className="text-2xl font-black text-primary leading-none">
                {userRank ?? "—"}
              </div>
              <div className="text-[10px] text-gray-400 mt-1 font-medium">
                الترتيب
              </div>
            </div>
          </div>
        </div>

        {/* لوحة المتصدرين */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
            <Trophy size={15} className="text-gold" />
            لوحة المتصدرين
          </h3>

          <div className="space-y-2">
            {leaderboard.map((u, i) => {
              const isMe = u.uid === user.uid;
              const isTop3 = i < 3;

              return (
                <div
                  key={u.uid}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-transparent"
                >
                  <div className="w-7 h-7 flex items-center justify-center text-xs font-black">
                    {isTop3 ? topThreeIcons[i] : i + 1}
                  </div>

                  <span className="flex-1 text-sm truncate text-primary">
                    {u.username}
                  </span>

                  <span className="text-sm font-bold text-gold">
                    {u.points}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="md:hidden block mx-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white active:scale-95 transition"
          >
            <LogOut size={16} />
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* 🔥 MOBILE ONLY LOGOUT BUTTON */}
    </div>
  );
}
