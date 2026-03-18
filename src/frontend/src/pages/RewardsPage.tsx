import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Loader2, Smartphone, Star } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { RedemptionType } from "../backend.d";
import { Variant_pending_approved_rejected } from "../backend.d";
import {
  useProfile,
  useSubmitUpiWithdrawal,
  useUpiWithdrawals,
} from "../hooks/useQueries";

const MIN_WITHDRAWAL = 5000;

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export function RewardsPage() {
  const { data: profile, isLoading } = useProfile();
  const { data: withdrawals, isLoading: withdrawalsLoading } =
    useUpiWithdrawals();
  const submitWithdrawal = useSubmitUpiWithdrawal();

  const [upiId, setUpiId] = useState("");
  const [upiAmount, setUpiAmount] = useState("");

  const balance = profile ? Number(profile.totalPoints) : 0;

  async function handleUpiWithdraw() {
    const amount = Number.parseInt(upiAmount);
    if (!upiId.trim()) {
      toast.error("Enter a valid UPI ID");
      return;
    }
    if (!amount || amount < MIN_WITHDRAWAL) {
      toast.error(`Minimum ${MIN_WITHDRAWAL.toLocaleString()} points required`);
      return;
    }
    if (amount > balance) {
      toast.error("Insufficient points");
      return;
    }
    try {
      await submitWithdrawal.mutateAsync({
        upiId: upiId.trim(),
        amount: BigInt(amount),
      });
      toast.success(
        "Withdrawal request submitted! Admin will process it soon.",
      );
      setUpiId("");
      setUpiAmount("");
    } catch {
      toast.error("Failed to submit withdrawal. Please try again.");
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Rewards</h1>
          <p className="text-muted-foreground text-sm">
            Redeem your points via UPI cash out.
          </p>
        </div>

        {/* Balance card */}
        <Card
          className="shadow-card bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
          data-ocid="rewards.balance.card"
        >
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Available Balance</p>
                {isLoading ? (
                  <Skeleton className="h-12 w-32 mt-1 bg-white/20" />
                ) : (
                  <p className="text-5xl font-bold mt-1">
                    {balance.toLocaleString()}
                  </p>
                )}
                <p className="text-sm opacity-70 mt-1">points</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Star className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* UPI Cash Out */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-primary" />
              UPI Cash Out
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Withdraw your points directly to your UPI account. Minimum{" "}
              <span className="font-semibold text-foreground">
                {MIN_WITHDRAWAL.toLocaleString()} points
              </span>{" "}
              required.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
              <div>
                <Label htmlFor="upi-id" className="text-xs">
                  UPI ID
                </Label>
                <Input
                  id="upi-id"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="mt-1"
                  data-ocid="rewards.upi_id.input"
                />
              </div>
              <div>
                <Label htmlFor="upi-amount" className="text-xs">
                  Amount (points)
                </Label>
                <Input
                  id="upi-amount"
                  type="number"
                  placeholder={String(MIN_WITHDRAWAL)}
                  min={MIN_WITHDRAWAL}
                  max={balance}
                  value={upiAmount}
                  onChange={(e) => setUpiAmount(e.target.value)}
                  className="mt-1"
                  data-ocid="rewards.upi_amount.input"
                />
              </div>
            </div>
            {upiAmount && Number.parseInt(upiAmount) >= MIN_WITHDRAWAL && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {Number.parseInt(upiAmount)} pts = ₹
                {(Number.parseInt(upiAmount) / 100).toFixed(2)}
                <span className="ml-2 text-muted-foreground/70">
                  (100 points = ₹1)
                </span>
              </p>
            )}
            <Button
              onClick={handleUpiWithdraw}
              disabled={
                submitWithdrawal.isPending ||
                !upiId.trim() ||
                !upiAmount ||
                Number.parseInt(upiAmount) < MIN_WITHDRAWAL ||
                Number.parseInt(upiAmount) > balance
              }
              data-ocid="rewards.upi_withdraw.primary_button"
            >
              {submitWithdrawal.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Request Withdrawal
            </Button>
          </CardContent>
        </Card>

        {/* My Withdrawal Requests */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              My Withdrawal Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {withdrawalsLoading ? (
              [1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full mb-2" />
              ))
            ) : (withdrawals ?? []).length > 0 ? (
              <div className="space-y-2">
                {(withdrawals ?? []).map((req, idx) => (
                  <div
                    key={String(req.id)}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg border border-border"
                    data-ocid={`rewards.withdrawal.item.${idx + 1}`}
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{req.upiId}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(
                            Number(req.timestamp) / 1_000_000,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">
                        {Number(req.amount)} pts
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${STATUS_STYLES[req.status] ?? ""}`}
                      >
                        {req.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p
                className="text-sm text-muted-foreground text-center py-6"
                data-ocid="rewards.withdrawals.empty_state"
              >
                No withdrawal requests yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Redemption history (existing) */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Redemption History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              [1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full mb-2" />
              ))
            ) : (profile?.redemptions ?? []).length > 0 ? (
              profile!.redemptions.map((r, idx) => (
                <div
                  key={String(r.id)}
                  className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
                  data-ocid={`rewards.history.item.${idx + 1}`}
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-success" />
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {r._type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(
                          Number(r.timestamp) / 1_000_000,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-destructive">
                    -{Number(r.amount)} pts
                  </span>
                </div>
              ))
            ) : (
              <p
                className="text-sm text-muted-foreground text-center py-6"
                data-ocid="rewards.history.empty_state"
              >
                No redemptions yet
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
