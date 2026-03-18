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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Pencil, Plus, PowerOff, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Ad } from "../backend.d";
import {
  useAddAd,
  useAds,
  useDeactivateAd,
  useIsAdmin,
  useUpdateAd,
} from "../hooks/useQueries";

type AdForm = {
  title: string;
  description: string;
  duration: string;
  rewardPoints: string;
  category: string;
};

const EMPTY_FORM: AdForm = {
  title: "",
  description: "",
  duration: "30",
  rewardPoints: "50",
  category: "Technology",
};

export function AdminPage() {
  const { data: ads, isLoading } = useAds();
  const { data: isAdmin } = useIsAdmin();
  const addAd = useAddAd();
  const updateAd = useUpdateAd();
  const deactivateAd = useDeactivateAd();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [form, setForm] = useState<AdForm>(EMPTY_FORM);

  function openCreate() {
    setEditingAd(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(ad: Ad) {
    setEditingAd(ad);
    setForm({
      title: ad.title,
      description: ad.description,
      duration: String(Number(ad.duration)),
      rewardPoints: String(Number(ad.rewardPoints)),
      category: ad.category,
    });
    setDialogOpen(true);
  }

  async function handleSubmit() {
    const data = {
      title: form.title,
      description: form.description,
      duration: BigInt(Number.parseInt(form.duration)),
      rewardPoints: BigInt(Number.parseInt(form.rewardPoints)),
      category: form.category,
    };
    try {
      if (editingAd) {
        await updateAd.mutateAsync({ id: editingAd.id, ...data });
        toast.success("Ad updated successfully");
      } else {
        await addAd.mutateAsync(data);
        toast.success("Ad created successfully");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save ad");
    }
  }

  async function handleDeactivate(id: bigint) {
    try {
      await deactivateAd.mutateAsync(id);
      toast.success("Ad deactivated");
    } catch {
      toast.error("Failed to deactivate ad");
    }
  }

  if (!isAdmin) {
    return (
      <main
        className="max-w-5xl mx-auto px-4 py-16 text-center"
        data-ocid="admin.error_state"
      >
        <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-semibold text-foreground">Access Denied</p>
        <p className="text-muted-foreground text-sm">
          You don't have admin privileges.
        </p>
      </main>
    );
  }

  const isPending = addAd.isPending || updateAd.isPending;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage ads on the platform.
            </p>
          </div>
          <Button
            onClick={openCreate}
            data-ocid="admin.create_ad.primary_button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Ad
          </Button>
        </div>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              All Ads ({(ads ?? []).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full mb-3 rounded-lg" />
              ))
            ) : (ads ?? []).length > 0 ? (
              <div className="space-y-3">
                {(ads ?? []).map((ad, idx) => (
                  <div
                    key={String(ad.id)}
                    className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors"
                    data-ocid={`admin.ad.item.${idx + 1}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold">{ad.title}</p>
                        <Badge
                          variant={ad.isActive ? "default" : "outline"}
                          className={`text-xs ${ad.isActive ? "bg-success/10 text-success border-success/20" : ""}`}
                        >
                          {ad.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {ad.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {ad.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {Number(ad.duration)}s &middot;{" "}
                        {Number(ad.rewardPoints)} pts reward
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(ad)}
                        data-ocid="admin.edit.edit_button"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      {ad.isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleDeactivate(ad.id)}
                          disabled={deactivateAd.isPending}
                          data-ocid="admin.deactivate.delete_button"
                        >
                          <PowerOff className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p
                className="text-sm text-muted-foreground text-center py-8"
                data-ocid="admin.ads.empty_state"
              >
                No ads yet. Create the first one!
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" data-ocid="admin.ad_form.dialog">
          <DialogHeader>
            <DialogTitle>{editingAd ? "Edit Ad" : "Create New Ad"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ad-title">Title</Label>
              <Input
                id="ad-title"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="Ad title"
                className="mt-1"
                data-ocid="admin.ad_title.input"
              />
            </div>
            <div>
              <Label htmlFor="ad-desc">Description</Label>
              <Textarea
                id="ad-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Ad description"
                className="mt-1"
                rows={3}
                data-ocid="admin.ad_description.textarea"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ad-dur">Duration (seconds)</Label>
                <Input
                  id="ad-dur"
                  type="number"
                  value={form.duration}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, duration: e.target.value }))
                  }
                  min={5}
                  className="mt-1"
                  data-ocid="admin.ad_duration.input"
                />
              </div>
              <div>
                <Label htmlFor="ad-pts">Reward Points</Label>
                <Input
                  id="ad-pts"
                  type="number"
                  value={form.rewardPoints}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, rewardPoints: e.target.value }))
                  }
                  min={1}
                  className="mt-1"
                  data-ocid="admin.ad_points.input"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="ad-cat">Category</Label>
              <Input
                id="ad-cat"
                value={form.category}
                onChange={(e) =>
                  setForm((p) => ({ ...p, category: e.target.value }))
                }
                placeholder="e.g. Technology"
                className="mt-1"
                data-ocid="admin.ad_category.input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="admin.ad_form.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending || !form.title}
              data-ocid="admin.ad_form.submit_button"
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingAd ? "Save Changes" : "Create Ad"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
