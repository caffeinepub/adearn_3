import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Trophy, Users } from "lucide-react";
import { motion } from "motion/react";
import { useLeaderboard } from "../hooks/useQueries";

export function CommunityPage() {
  const { data: leaderboard, isLoading } = useLeaderboard();

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Community</h1>
          <p className="text-muted-foreground text-sm">
            See how you rank among all earners.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card className="shadow-card">
            <CardContent className="pt-5 pb-5 flex items-center gap-3">
              <Users className="w-6 h-6 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">
                  {isLoading ? "—" : (leaderboard?.length ?? 0)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-5 pb-5 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-success" />
              <div>
                <p className="text-xs text-muted-foreground">
                  Total Points Given
                </p>
                <p className="text-2xl font-bold">
                  {isLoading
                    ? "—"
                    : (leaderboard ?? [])
                        .reduce((acc, p) => acc + Number(p.totalPoints), 0)
                        .toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card col-span-2 sm:col-span-1">
            <CardContent className="pt-5 pb-5 flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <div>
                <p className="text-xs text-muted-foreground">Top Earner</p>
                <p className="text-lg font-bold truncate">
                  {isLoading ? "—" : (leaderboard?.[0]?.username ?? "—")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Full leaderboard */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              Full Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 w-full mb-2 rounded-lg" />
              ))
            ) : (leaderboard ?? []).length > 0 ? (
              (leaderboard ?? []).map((p, idx) => (
                <div
                  key={p.username}
                  className="flex items-center gap-4 py-3 border-b border-border last:border-0"
                  data-ocid={`community.leaderboard.item.${idx + 1}`}
                >
                  <span
                    className={`w-8 text-center text-sm font-bold ${idx === 0 ? "text-yellow-500" : idx === 1 ? "text-slate-400" : idx === 2 ? "text-orange-500" : "text-muted-foreground"}`}
                  >
                    #{idx + 1}
                  </span>
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className="text-xs bg-accent">
                      {p.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="flex-1 text-sm font-medium">{p.username}</p>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">
                      {Number(p.totalPoints).toLocaleString()} pts
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Number(p.adsWatched)} ads watched
                    </p>
                  </div>
                  {idx < 3 && (
                    <Badge variant="outline" className="text-xs">
                      {idx === 0
                        ? "🥇 Gold"
                        : idx === 1
                          ? "🥈 Silver"
                          : "🥉 Bronze"}
                    </Badge>
                  )}
                </div>
              ))
            ) : (
              <p
                className="text-sm text-muted-foreground text-center py-8"
                data-ocid="community.leaderboard.empty_state"
              >
                No earners yet — be the first!
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
