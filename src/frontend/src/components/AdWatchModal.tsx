import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Ad } from "../backend.d";
import { useWatchAd } from "../hooks/useQueries";

const AD_COLORS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-600",
  "from-purple-500 to-pink-600",
  "from-yellow-500 to-orange-600",
];

interface AdWatchModalProps {
  ad: Ad | null;
  open: boolean;
  onClose: () => void;
}

export function AdWatchModal({ ad, open, onClose }: AdWatchModalProps) {
  const duration = ad ? Number(ad.duration) : 30;
  const [timeLeft, setTimeLeft] = useState(duration);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchAd = useWatchAd();
  const colorClass = AD_COLORS[Number(ad?.id ?? 0) % AD_COLORS.length];

  useEffect(() => {
    if (!open || !ad) return;
    setTimeLeft(Number(ad.duration));
    setCompleted(false);
  }, [open, ad]);

  useEffect(() => {
    if (!open || completed) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [open, completed]);

  async function handleClaim() {
    if (!ad) return;
    try {
      await watchAd.mutateAsync(ad.id);
      toast.success(`+${Number(ad.rewardPoints)} points earned!`, {
        description: `You watched "${ad.title}" successfully.`,
      });
      onClose();
    } catch {
      toast.error("Failed to record ad watch. Please try again.");
    }
  }

  const progress = ad ? ((duration - timeLeft) / duration) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg" data-ocid="adwatch.dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Watching Ad</span>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
              data-ocid="adwatch.close_button"
            >
              <X className="w-4 h-4" />
            </button>
          </DialogTitle>
        </DialogHeader>

        {/* Ad Placeholder */}
        <div
          className={`relative rounded-xl bg-gradient-to-br ${colorClass} aspect-video flex flex-col items-center justify-center text-white overflow-hidden`}
        >
          <AnimatePresence mode="wait">
            {completed ? (
              <motion.div
                key="done"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-2"
              >
                <CheckCircle className="w-16 h-16" />
                <p className="text-xl font-bold">Ad Complete!</p>
              </motion.div>
            ) : (
              <motion.div
                key="ad"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3 px-8 text-center"
              >
                <p className="text-xs uppercase tracking-widest opacity-70">
                  Sponsored
                </p>
                <p className="text-2xl font-bold">{ad?.title}</p>
                <p className="text-sm opacity-80">{ad?.description}</p>
                <p className="text-xs opacity-60 mt-1">{ad?.category}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!completed && (
            <div className="absolute bottom-3 right-3 bg-black/50 rounded-full px-2.5 py-0.5 text-sm font-mono font-bold">
              {timeLeft}s
            </div>
          )}
        </div>

        {/* Progress */}
        <Progress value={progress} className="h-1.5" />

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {completed ? "You've earned" : "You'll earn"}{" "}
            <span className="font-semibold text-success">
              {ad ? Number(ad.rewardPoints) : 0} pts
            </span>
          </p>
          <Button
            onClick={handleClaim}
            disabled={!completed || watchAd.isPending}
            className="bg-primary text-primary-foreground"
            data-ocid="adwatch.claim.button"
          >
            {watchAd.isPending
              ? "Claiming..."
              : completed
                ? "Claim Points"
                : `Wait ${timeLeft}s`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
