import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface EarningsHistory {
    title: string;
    adId: bigint;
    timestamp: bigint;
    points: bigint;
}
export interface Redemption {
    id: bigint;
    _type: RedemptionType;
    timestamp: bigint;
    amount: bigint;
}
export interface UpiWithdrawalRequest {
    id: bigint;
    status: Variant_pending_approved_rejected;
    userId: Principal;
    timestamp: bigint;
    upiId: string;
    amount: bigint;
}
export interface Profile {
    username: string;
    balance: bigint;
    totalPoints: bigint;
    redemptions: Array<Redemption>;
    adsWatched: bigint;
    _adsHistory: Array<EarningsHistory>;
}
export interface Ad {
    id: bigint;
    title: string;
    duration: bigint;
    rewardPoints: bigint;
    description: string;
    isActive: boolean;
    category: string;
    videoUrl?: string;
}
export enum RedemptionType {
    cashout = "cashout",
    giftcard = "giftcard"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_pending_approved_rejected {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export interface backendInterface {
    addAd(title: string, description: string, duration: bigint, rewardPoints: bigint, category: string, videoUrl: string | null): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deactivateAd(id: bigint): Promise<void>;
    getAds(): Promise<Array<Ad>>;
    getAllUpiWithdrawals(): Promise<Array<UpiWithdrawalRequest>>;
    getCallerUserProfile(): Promise<Profile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLeaderboard(): Promise<Array<Profile>>;
    getMyUpiWithdrawals(): Promise<Array<UpiWithdrawalRequest>>;
    getUserProfile(user: Principal): Promise<Profile | null>;
    isCallerAdmin(): Promise<boolean>;
    redeemPoints(_type: RedemptionType, amount: bigint): Promise<void>;
    saveCallerUserProfile(profile: Profile): Promise<void>;
    submitUpiWithdrawal(upiId: string, amount: bigint): Promise<void>;
    updateAd(id: bigint, title: string, description: string, duration: bigint, rewardPoints: bigint, category: string, videoUrl: string | null): Promise<void>;
    updateUpiWithdrawalStatus(id: bigint, status: Variant_pending_approved_rejected): Promise<void>;
    watchAd(adId: bigint): Promise<void>;
}
