import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Filter, Play, Tv2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Ad } from "../backend.d";
import { AdWatchModal } from "../components/AdWatchModal";
import { useAds } from "../hooks/useQueries";

const CATEGORY_COLORS: Record<string, string> = {
  technology: "bg-blue-50 text-blue-700 border-blue-200",
  finance: "bg-green-50 text-green-700 border-green-200",
  entertainment: "bg-purple-50 text-purple-700 border-purple-200",
  lifestyle: "bg-orange-50 text-orange-700 border-orange-200",
  health: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

// Fixed reward per ad watch
const AD_WATCH_REWARD = 100;

export function EarnPage() {
  const { data: ads, isLoading } = useAds();
  const [watchingAd, setWatchingAd] = useState<Ad | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const activeAds = (ads ?? []).filter((a) => a.isActive);
  const categories = [...new Set(activeAds.map((a) => a.category))];

  const filtered = activeAds.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = !selectedCategory || a.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-foreground mb-1">Earn Points</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Watch ads and earn{" "}
          <span className="font-semibold text-foreground">
            {AD_WATCH_REWARD} points
          </span>{" "}
          per ad.
        </p>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search ads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-ocid="earn.search_input"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              data-ocid="earn.all.tab"
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                data-ocid="earn.category.tab"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Ads grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((ad, idx) => (
              <motion.div
                key={String(ad.id)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  className="shadow-card hover:shadow-md transition-shadow cursor-pointer h-full"
                  onClick={() => setWatchingAd(ad)}
                  data-ocid={`earn.ad.item.${idx + 1}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-semibold leading-tight">
                        {ad.title}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={`text-xs shrink-0 ${CATEGORY_COLORS[ad.category.toLowerCase()] ?? ""}`}
                      >
                        {ad.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {ad.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {Number(ad.duration)}s
                      </div>
                      <div className="flex items-center gap-1.5">
                        {ad.videoUrl && (
                          <Tv2 className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                        <span className="text-sm font-bold text-success">
                          +{AD_WATCH_REWARD} pts
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      data-ocid="earn.watch.primary_button"
                    >
                      <Play className="w-3.5 h-3.5 mr-1.5" />
                      Watch &amp; Earn
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : !isLoading && activeAds.length === 0 ? (
          <div className="text-center py-20" data-ocid="earn.ads.empty_state">
            <Tv2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-base font-semibold text-foreground mb-1">
              No ads available right now.
            </p>
            <p className="text-sm text-muted-foreground">Check back soon!</p>
          </div>
        ) : (
          <div className="text-center py-16" data-ocid="earn.ads.empty_state">
            <p className="text-muted-foreground">
              No ads found matching your search.
            </p>
          </div>
        )}
      </motion.div>

      <AdWatchModal
        ad={watchingAd}
        open={!!watchingAd}
        onClose={() => setWatchingAd(null)}
      />
    </main>
  );
}
