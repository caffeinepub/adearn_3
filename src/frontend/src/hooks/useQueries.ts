import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Ad,
  Profile,
  RedemptionType,
  UpiWithdrawalRequest,
  Variant_pending_approved_rejected,
} from "../backend.d";
import { useActor } from "./useActor";

export function useAds() {
  const { actor, isFetching } = useActor();
  return useQuery<Ad[]>({
    queryKey: ["ads"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAds();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProfile(options?: { refetchInterval?: number }) {
  const { actor, isFetching } = useActor();
  return useQuery<Profile | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
    ...(options ?? {}),
  });
}

export function useLeaderboard() {
  const { actor, isFetching } = useActor();
  return useQuery<Profile[]>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useWatchAd() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (adId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.watchAd(adId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

export function useRedeemPoints() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      type,
      amount,
    }: { type: RedemptionType; amount: bigint }) => {
      if (!actor) throw new Error("No actor");
      return actor.redeemPoints(type, amount);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useAddAd() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      duration: bigint;
      rewardPoints: bigint;
      category: string;
      videoUrl: string | null;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addAd(
        data.title,
        data.description,
        data.duration,
        data.rewardPoints,
        data.category,
        data.videoUrl,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useUpdateAd() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      description: string;
      duration: bigint;
      rewardPoints: bigint;
      category: string;
      videoUrl: string | null;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateAd(
        data.id,
        data.title,
        data.description,
        data.duration,
        data.rewardPoints,
        data.category,
        data.videoUrl,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useDeactivateAd() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deactivateAd(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: Profile) => {
      if (!actor) throw new Error("No actor");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useUpiWithdrawals() {
  const { actor, isFetching } = useActor();
  return useQuery<UpiWithdrawalRequest[]>({
    queryKey: ["upiWithdrawals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyUpiWithdrawals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllUpiWithdrawals() {
  const { actor, isFetching } = useActor();
  return useQuery<UpiWithdrawalRequest[]>({
    queryKey: ["allUpiWithdrawals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUpiWithdrawals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitUpiWithdrawal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      upiId,
      amount,
    }: { upiId: string; amount: bigint }) => {
      if (!actor) throw new Error("No actor");
      return actor.submitUpiWithdrawal(upiId, amount);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["upiWithdrawals"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useUpdateUpiWithdrawalStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: { id: bigint; status: Variant_pending_approved_rejected }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateUpiWithdrawalStatus(id, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["upiWithdrawals"] });
      qc.invalidateQueries({ queryKey: ["allUpiWithdrawals"] });
    },
  });
}
