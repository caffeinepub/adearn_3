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
}
export interface Redemption {
    id: bigint;
    _type: RedemptionType;
    timestamp: bigint;
    amount: bigint;
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
export interface backendInterface {
    addAd(title: string, description: string, duration: bigint, rewardPoints: bigint, category: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deactivateAd(id: bigint): Promise<void>;
    getAds(): Promise<Array<Ad>>;
    getCallerUserProfile(): Promise<Profile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLeaderboard(): Promise<Array<Profile>>;
    getUserProfile(user: Principal): Promise<Profile | null>;
    isCallerAdmin(): Promise<boolean>;
    redeemPoints(_type: RedemptionType, amount: bigint): Promise<void>;
    saveCallerUserProfile(profile: Profile): Promise<void>;
    updateAd(id: bigint, title: string, description: string, duration: bigint, rewardPoints: bigint, category: string): Promise<void>;
    watchAd(adId: bigint): Promise<void>;
}
