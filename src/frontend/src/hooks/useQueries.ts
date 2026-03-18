import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Ad, Profile, RedemptionType } from "../backend.d";
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

export function useProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<Profile | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
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
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addAd(
        data.title,
        data.description,
        data.duration,
        data.rewardPoints,
        data.category,
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
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateAd(
        data.id,
        data.title,
        data.description,
        data.duration,
        data.rewardPoints,
        data.category,
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
