import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, DollarSign, Gift, Loader2, Star } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { RedemptionType } from "../backend.d";
import { useProfile, useRedeemPoints } from "../hooks/useQueries";

const GIFT_CARDS = [
  { brand: "Amazon", value: 1000, label: "$10 Gift Card" },
  { brand: "Netflix", value: 2000, label: "$20 Gift Card" },
  { brand: "Steam", value: 1500, label: "$15 Game Credit" },
  { brand: "Apple", value: 2500, label: "$25 App Store" },
];

export function RewardsPage() {
  const { data: profile, isLoading } = useProfile();
  const redeem = useRedeemPoints();
  const [redeemDialog, setRedeemDialog] = useState<{
    type: RedemptionType;
    label: string;
    amount: number;
  } | null>(null);
  const [cashoutAmount, setCashoutAmount] = useState("");

  const balance = profile ? Number(profile.totalPoints) : 0;

  async function handleRedeem() {
    if (!redeemDialog) return;
    const amount =
      redeemDialog.type === RedemptionType.cashout
        ? Number.parseInt(cashoutAmount)
        : redeemDialog.amount;
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (amount > balance) {
      toast.error("Insufficient points");
      return;
    }
    try {
      await redeem.mutateAsync({
        type: redeemDialog.type,
        amount: BigInt(amount),
      });
      toast.success(`Redeemed ${amount} points for ${redeemDialog.label}!`);
      setRedeemDialog(null);
      setCashoutAmount("");
    } catch {
      toast.error("Redemption failed. Please try again.");
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
            Redeem your points for gift cards or cash.
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

        {/* Gift Cards */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-4">
            Gift Cards
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {GIFT_CARDS.map((gc, idx) => (
              <Card
                key={gc.brand}
                className="shadow-card hover:shadow-md transition-shadow"
                data-ocid={`rewards.giftcard.item.${idx + 1}`}
              >
                <CardContent className="pt-5 pb-5">
                  <div className="flex flex-col gap-3">
                    <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                      <Gift className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{gc.brand}</p>
                      <p className="text-xs text-muted-foreground">
                        {gc.label}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {gc.value} pts
                      </Badge>
                      <Button
                        size="sm"
                        variant={balance >= gc.value ? "default" : "outline"}
                        disabled={balance < gc.value}
                        onClick={() =>
                          setRedeemDialog({
                            type: RedemptionType.giftcard,
                            label: `${gc.brand} ${gc.label}`,
                            amount: gc.value,
                          })
                        }
                        data-ocid="rewards.redeem.primary_button"
                      >
                        Redeem <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cashout */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-success" />
              Cash Out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Convert your points to cash. Minimum 500 points required.
            </p>
            <div className="flex gap-3 max-w-sm">
              <div className="flex-1">
                <Label htmlFor="cashout" className="text-xs">
                  Points to redeem
                </Label>
                <Input
                  id="cashout"
                  type="number"
                  placeholder="500"
                  min={500}
                  max={balance}
                  value={cashoutAmount}
                  onChange={(e) => setCashoutAmount(e.target.value)}
                  className="mt-1"
                  data-ocid="rewards.cashout.input"
                />
              </div>
              <div className="flex items-end">
                <Button
                  disabled={
                    !cashoutAmount ||
                    Number.parseInt(cashoutAmount) < 500 ||
                    Number.parseInt(cashoutAmount) > balance
                  }
                  onClick={() =>
                    setRedeemDialog({
                      type: RedemptionType.cashout,
                      label: "Cash Out",
                      amount: Number.parseInt(cashoutAmount),
                    })
                  }
                  data-ocid="rewards.cashout.primary_button"
                >
                  Cash Out
                </Button>
              </div>
            </div>
            {cashoutAmount && Number.parseInt(cashoutAmount) >= 500 && (
              <p className="text-xs text-muted-foreground mt-2">
                \u2248 ${(Number.parseInt(cashoutAmount) / 100).toFixed(2)} USD
              </p>
            )}
          </CardContent>
        </Card>

        {/* Redemption history */}
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
                    {r._type === RedemptionType.cashout ? (
                      <DollarSign className="w-4 h-4 text-success" />
                    ) : (
                      <Gift className="w-4 h-4 text-primary" />
                    )}
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

      {/* Redeem confirm dialog */}
      <Dialog
        open={!!redeemDialog}
        onOpenChange={(v) => !v && setRedeemDialog(null)}
      >
        <DialogContent data-ocid="rewards.redeem.dialog">
          <DialogHeader>
            <DialogTitle>Confirm Redemption</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Redeem <strong>{redeemDialog?.amount} points</strong> for{" "}
            <strong>{redeemDialog?.label}</strong>?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRedeemDialog(null)}
              data-ocid="rewards.redeem.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRedeem}
              disabled={redeem.isPending}
              data-ocid="rewards.redeem.confirm_button"
            >
              {redeem.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
