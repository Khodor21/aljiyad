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
} from "lucide-react";

interface LeaderboardUser {
  uid: string;
  username: string;
  points: number;
}

export default function ProfilePage() {
  const { user, appUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [completions, setCompletions] = useState<Record<string, boolean>>({});
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
        compSnap.forEach((d) => {
          compMap[d.id] = true;
        });
        setCompletions(compMap);

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

  const getStats = (): BadgeStats => {
    const fullyCompletedDays: number[] = [];
    defaultChallenges.forEach((day: any) => {
      const allDone = day.tasks.every((t: any) => completions[t.id]);
      if (allDone) fullyCompletedDays.push(day.id);
    });
    return {
      completedDays: fullyCompletedDays.length,
      totalPoints: appUser?.points || 0,
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
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-gold/5 rounded-full translate-y-1/2 -translate-x-1/2" />

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
                {appUser.points || 0}
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

        {/* الأوسمة */}
        <div
          className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
            <Trophy size={15} className="text-gold" />
            الأوسمة
          </h3>
          <div className="grid grid-cols-5 gap-2.5">
            {allBadges.map((badge) => (
              <BadgeDisplay
                key={badge.id}
                id={badge.id}
                name={badge.name}
                description={badge.description}
                icon={badge.icon}
                earned={earned.some((e) => e.id === badge.id)}
              />
            ))}
          </div>
        </div>

        {/* لوحة المتصدرين */}
        <div
          className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
            <Trophy size={15} className="text-gold" />
            لوحة المتصدرين
          </h3>

          {leaderboard.length === 0 ? (
            <p className="text-center text-gray-300 text-sm py-10">
              لا يوجد متحدين بعد
            </p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((u, i) => {
                const isMe = u.uid === user.uid;
                const isTop3 = i < 3;

                return (
                  <div
                    key={u.uid}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                      isMe
                        ? "bg-gold/[0.06] border border-gold/20 shadow-sm shadow-gold/5"
                        : isTop3
                          ? "bg-gray-50/80 border border-gray-100"
                          : "border border-transparent"
                    }`}
                  >
                    {/* الترتيب */}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black ${
                        isTop3
                          ? i === 0
                            ? "bg-yellow-500/10 text-yellow-600"
                            : i === 1
                              ? "bg-gray-200/60 text-gray-500"
                              : "bg-amber-100/60 text-amber-600"
                          : "text-gray-300"
                      }`}
                    >
                      {isTop3 ? topThreeIcons[i] : i + 1}
                    </div>

                    {/* الاسم */}
                    <span
                      className={`flex-1 text-sm truncate ${
                        isMe
                          ? "text-gold font-bold"
                          : isTop3
                            ? "text-primary font-semibold"
                            : "text-gray-500 font-medium"
                      }`}
                    >
                      {u.username}
                      {isMe && (
                        <span className="text-[10px] text-gold/50 font-normal mr-1">
                          (أنت)
                        </span>
                      )}
                    </span>

                    {/* النقاط */}
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        isMe
                          ? "text-gold"
                          : isTop3
                            ? "text-primary"
                            : "text-gray-400"
                      }`}
                    >
                      {u.points}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
