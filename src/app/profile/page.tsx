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
import { Loader2, Trophy, Medal, User, Award, TrendingUp } from "lucide-react";

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
        // تحميل إكمالات المستخدم
        const compSnap = await getDocs(
          collection(db, "completions", user.uid, "tasks"),
        );
        const compMap: Record<string, boolean> = {};
        compSnap.forEach((d) => {
          compMap[d.id] = true;
        });
        setCompletions(compMap);

        // تحميل لوحة المتصدرين
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

        // تحديد ترتيب المستخدم
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

  // حساب الأوسمة
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
      <div className="min-h-screen islamic-pattern flex items-center justify-center">
        <Loader2 size={40} className="text-gold animate-spin" />
      </div>
    );
  }

  if (!user || !appUser) return null;

  const stats = getStats();
  const earned = getEarnedBadges(stats);

  return (
    <div className="min-h-screen islamic-pattern-dark">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* بطاقة المستخدم */}
        <div className="card p-6 mb-6 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center flex-shrink-0">
              <User size={28} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">
                {appUser.username}
              </h2>
              <div className="flex items-center gap-4 mt-1 text-xs text-white/40">
                <span>الجوال: {appUser.phone}</span>
                <span>العمر: {appUser.age} سنة</span>
              </div>
            </div>
          </div>

          {/* الإحصائيات */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-gold/10 rounded-xl p-3 text-center">
              <TrendingUp size={18} className="text-gold mx-auto mb-1" />
              <div className="text-xl font-black text-gold-light">
                {appUser.points || 0}
              </div>
              <div className="text-[10px] text-white/40">نقطة</div>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3 text-center">
              <Award size={18} className="text-white/40 mx-auto mb-1" />
              <div className="text-xl font-black text-white">
                {earned.length}
              </div>
              <div className="text-[10px] text-white/40">وسام</div>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3 text-center">
              <Medal size={18} className="text-white/40 mx-auto mb-1" />
              <div className="text-xl font-black text-white">
                {userRank ?? "—"}
              </div>
              <div className="text-[10px] text-white/40">الترتيب</div>
            </div>
          </div>
        </div>

        {/* الأوسمة */}
        <div
          className="card p-6 mb-6 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-gold" />
            الأوسمة
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
          className="card p-6 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-gold" />
            لوحة المتصدرين
          </h3>

          {leaderboard.length === 0 ? (
            <p className="text-center text-white/30 text-sm py-8">
              لا يوجد متحدين بعد
            </p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((u, i) => {
                const isMe = u.uid === user.uid;
                const rankColors = [
                  "bg-yellow-500/20 text-yellow-300",
                  "bg-gray-300/15 text-gray-300",
                  "bg-amber-700/20 text-amber-500",
                ];
                return (
                  <div
                    key={u.uid}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isMe
                        ? "bg-gold/10 border border-gold/25"
                        : "bg-white/[0.02] border border-transparent"
                    }`}
                  >
                    {/* الترتيب */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-black ${
                        i < 3 ? rankColors[i] : "bg-white/5 text-white/30"
                      }`}
                    >
                      {i + 1}
                    </div>

                    {/* الاسم */}
                    <span
                      className={`flex-1 text-sm font-semibold ${isMe ? "text-gold-light" : "text-white/80"}`}
                    >
                      {u.username}
                      {isMe && (
                        <span className="text-[10px] text-gold/60 mr-1">
                          (أنت)
                        </span>
                      )}
                    </span>

                    {/* النقاط */}
                    <span className="text-sm font-bold text-gold-light">
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
