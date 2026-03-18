import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Eye, Play, Star, TrendingUp, Trophy, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { Ad } from "../backend.d";
import { AdWatchModal } from "../components/AdWatchModal";
import { useAds, useLeaderboard, useProfile } from "../hooks/useQueries";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildChartData(
  adsHistory: Array<{ timestamp: bigint; points: bigint }> | undefined,
) {
  const now = new Date();
  const days: { day: string; points: number; dateKey: string }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const label = i === 0 ? "Today" : DAY_LABELS[d.getDay()];
    days.push({ day: label, points: 0, dateKey });
  }

  if (!adsHistory) return days;

  for (const h of adsHistory) {
    const ms = Number(h.timestamp) / 1_000_000;
    const d = new Date(ms);
    const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const entry = days.find((x) => x.dateKey === dateKey);
    if (entry) {
      entry.points += Number(h.points);
    }
  }

  return days;
}

export function DashboardPage() {
  const { data: profile, isLoading: profileLoading } = useProfile({
    refetchInterval: 10_000,
  });
  const { data: ads, isLoading: adsLoading } = useAds();
  const { data: leaderboard } = useLeaderboard();
  const [watchingAd, setWatchingAd] = useState<Ad | null>(null);

  const activeAds = (ads ?? []).filter((a) => a.isActive);
  const currentAd = activeAds[0] ?? null;
  const watchNextAds = activeAds.slice(1, 5);

  const username = profile?.username || "User";
  const totalPoints = profile ? Number(profile.totalPoints) : 0;
  const adsWatched = profile ? Number(profile.adsWatched) : 0;

  let rank = "\u2014";
  if (leaderboard && profile) {
    const idx = leaderboard.findIndex((p) => p.username === profile.username);
    if (idx !== -1) rank = `#${idx + 1}`;
  }

  const chartData = useMemo(
    () => buildChartData(profile?._adsHistory),
    [profile?._adsHistory],
  );

  const todayPoints = useMemo(() => {
    if (!profile?._adsHistory) return 0;
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    return profile._adsHistory.reduce((sum, h) => {
      const ms = Number(h.timestamp) / 1_000_000;
      const d = new Date(ms);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      return key === todayKey ? sum + Number(h.points) : sum;
    }, 0);
  }, [profile?._adsHistory]);

  return (
    <>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Greeting */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {profileLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-5 w-40" />
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {username}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Start earning points today.
              </p>
            </>
          )}
        </motion.section>

        {/* KPI Cards */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          aria-label="Key metrics"
        >
          <Card className="shadow-card" data-ocid="kpi.points.card">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Total Points
                  </p>
                  {profileLoading ? (
                    <Skeleton className="h-8 w-20 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground">
                      {totalPoints.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card" data-ocid="kpi.ads_watched.card">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Ads Watched
                  </p>
                  {profileLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground">
                      {adsWatched}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card" data-ocid="kpi.rank.card">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Rank
                  </p>
                  <p className="text-3xl font-bold text-foreground">{rank}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Two-column section */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-6"
        >
          {/* Left: Current Ad Session */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                  Current Ad Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                {adsLoading ? (
                  <Skeleton className="w-full aspect-video rounded-lg" />
                ) : currentAd ? (
                  <div className="space-y-4">
                    {/* Fake video player */}
                    <button
                      type="button"
                      className="relative w-full aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:from-primary/30 transition-colors border border-border group"
                      onClick={() => setWatchingAd(currentAd)}
                      data-ocid="dashboard.ad_player.canvas_target"
                    >
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <Play className="w-7 h-7 text-primary-foreground ml-1" />
                      </div>
                      <p className="mt-3 font-semibold text-foreground text-lg">
                        {currentAd.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {currentAd.description}
                      </p>
                      <div className="absolute bottom-3 right-3 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {Number(currentAd.duration)}s
                        </Badge>
                        <Badge className="text-xs bg-success/10 text-success border-success/20">
                          +{Number(currentAd.rewardPoints)} pts
                        </Badge>
                      </div>
                    </button>
                    <Button
                      onClick={() => setWatchingAd(currentAd)}
                      className="w-full font-semibold"
                      data-ocid="dashboard.watch_ad.primary_button"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Watch Ad &amp; Earn {Number(currentAd.rewardPoints)}{" "}
                      Points
                    </Button>
                  </div>
                ) : (
                  <div
                    className="aspect-video rounded-xl bg-muted flex items-center justify-center"
                    data-ocid="dashboard.ad_player.empty_state"
                  >
                    <p className="text-muted-foreground text-sm">
                      No ads available right now
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Watch Next */}
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                  Watch Next
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {adsLoading ? (
                  [1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                  ))
                ) : watchNextAds.length > 0 ? (
                  watchNextAds.map((ad, idx) => (
                    <button
                      type="button"
                      key={String(ad.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors text-left"
                      onClick={() => setWatchingAd(ad)}
                      data-ocid={`dashboard.watch_next.item.${idx + 1}`}
                    >
                      <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <Play className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {ad.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Number(ad.duration)}s &middot; {ad.category}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        +{Number(ad.rewardPoints)} pts
                      </Badge>
                    </button>
                  ))
                ) : (
                  <p
                    className="text-sm text-muted-foreground py-4 text-center"
                    data-ocid="dashboard.watch_next.empty_state"
                  >
                    No more ads queued
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Chart + Activity */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Real-Time Earnings Tracker
                  </span>
                  {!profileLoading && (
                    <Badge
                      variant="secondary"
                      className="ml-auto text-xs flex items-center gap-1 bg-success/10 text-success border-success/20"
                      data-ocid="dashboard.today_points.badge"
                    >
                      <Zap className="w-3 h-3" />
                      Today: {todayPoints} pts
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profileLoading ? (
                  <Skeleton className="w-full h-40 rounded-lg" />
                ) : (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart
                      data={chartData}
                      margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 11, fill: "#6B7280" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#6B7280" }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <RechartTooltip
                        contentStyle={{
                          background: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        cursor={{ fill: "rgba(47,111,228,0.06)" }}
                        formatter={(value: number) => [
                          `${value} pts`,
                          "Points",
                        ]}
                      />
                      <Bar
                        dataKey="points"
                        fill="#2F6FE4"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                  Points Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {profileLoading ? (
                  [1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))
                ) : (profile?._adsHistory ?? []).length > 0 ? (
                  (profile?._adsHistory ?? []).slice(0, 5).map((h, idx) => (
                    <div
                      key={`${h.adId}-${idx}`}
                      className="flex items-center justify-between"
                      data-ocid={`dashboard.activity.item.${idx + 1}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-success" />
                        <p className="text-xs text-foreground truncate max-w-[120px]">
                          {h.title}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-success">
                        +{Number(h.points)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div
                    className="py-3"
                    data-ocid="dashboard.activity.empty_state"
                  >
                    <p className="text-xs text-muted-foreground text-center">
                      No activity yet — watch an ad!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Leaderboard */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-primary" />
                  Top Earners Leaderboard (weekly)
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {(leaderboard ?? SAMPLE_LEADERBOARD).slice(0, 5).map((p, idx) => (
                <div
                  key={p.username}
                  className="flex items-center gap-3 py-2.5 border-b border-border last:border-0"
                  data-ocid={`leaderboard.item.${idx + 1}`}
                >
                  <span
                    className={`w-6 text-center text-sm font-bold ${
                      idx === 0
                        ? "text-yellow-500"
                        : idx === 1
                          ? "text-slate-400"
                          : idx === 2
                            ? "text-orange-500"
                            : "text-muted-foreground"
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs bg-accent text-foreground">
                      {p.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="flex-1 text-sm font-medium">{p.username}</p>
                  <span className="text-sm font-bold text-primary">
                    {Number(p.totalPoints).toLocaleString()} pts
                  </span>
                </div>
              ))}
              {(!leaderboard || leaderboard.length === 0) && (
                <p
                  className="text-sm text-muted-foreground text-center py-4"
                  data-ocid="leaderboard.empty_state"
                >
                  No data yet
                </p>
              )}
            </CardContent>
          </Card>
        </motion.section>
      </main>

      <AdWatchModal
        ad={watchingAd}
        open={!!watchingAd}
        onClose={() => setWatchingAd(null)}
      />
    </>
  );
}

const SAMPLE_LEADERBOARD = [
  {
    username: "CryptoKing",
    totalPoints: 12450n,
    adsWatched: 0n,
    balance: 0n,
    redemptions: [],
    _adsHistory: [],
  },
  {
    username: "EarnerPro",
    totalPoints: 9800n,
    adsWatched: 0n,
    balance: 0n,
    redemptions: [],
    _adsHistory: [],
  },
  {
    username: "WatchMaster",
    totalPoints: 7650n,
    adsWatched: 0n,
    balance: 0n,
    redemptions: [],
    _adsHistory: [],
  },
  {
    username: "PointsQueen",
    totalPoints: 6100n,
    adsWatched: 0n,
    balance: 0n,
    redemptions: [],
    _adsHistory: [],
  },
  {
    username: "AdWatcher99",
    totalPoints: 4200n,
    adsWatched: 0n,
    balance: 0n,
    redemptions: [],
    _adsHistory: [],
  },
];
