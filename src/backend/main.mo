import Array "mo:core/Array";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Order "mo:core/Order";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type RedemptionType = {
    #giftcard;
    #cashout;
  };

  type EarningsHistory = {
    adId : Nat;
    title : Text;
    points : Nat;
    timestamp : Int;
  };

  type Redemption = {
    id : Nat;
    _type : RedemptionType;
    amount : Nat;
    timestamp : Int;
  };

  type Profile = {
    username : Text;
    totalPoints : Nat;
    balance : Nat;
    adsWatched : Nat;
    redemptions : [Redemption];
    _adsHistory : [EarningsHistory];
  };

  module Profile {
    public func compare(p1 : Profile, p2 : Profile) : Order.Order {
      Nat.compare(p2.totalPoints, p1.totalPoints);
    };
  };

  type Ad = {
    id : Nat;
    title : Text;
    description : Text;
    duration : Nat;
    rewardPoints : Nat;
    category : Text;
    isActive : Bool;
  };

  var currentAdId = 1;
  var currentRedemptionId = 1;

  let persistentProfiles = Map.empty<Principal, Profile>();
  let persistentAds = Map.empty<Nat, Ad>();

  // Map from principal to a map of adId to last watched timestamp
  let adWatchHistory = Map.empty<Principal, Map.Map<Nat, Int>>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getCallerUserProfile() : async ?Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    persistentProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?Profile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    persistentProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : Profile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    persistentProfiles.add(caller, profile);
  };

  public shared ({ caller }) func watchAd(adId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can watch ads");
    };

    let ad = switch (persistentAds.get(adId)) {
      case (?ad) { ad };
      case (null) { Runtime.trap("Ad not found") };
    };

    if (not ad.isActive) {
      Runtime.trap("Ad not active");
    };

    let now = Time.now();
    let userAds = switch (adWatchHistory.get(caller)) {
      case (null) {
        let newWatched = Map.empty<Nat, Int>();
        adWatchHistory.add(caller, newWatched);
        newWatched;
      };
      case (?existing) { existing };
    };

    switch (userAds.get(adId)) {
      case (?lastWatched) {
        let twentyFourHoursInNanos = 24 * 60 * 60 * 1_000_000_000;
        if (now - lastWatched < twentyFourHoursInNanos) {
          Runtime.trap("You have already watched this ad within the past 24 hours");
        };
      };
      case (null) {};
    };

    userAds.add(adId, now);

    let currentProfile = switch (persistentProfiles.get(caller)) {
      case (null) {
        {
          username = caller.toText();
          totalPoints = ad.rewardPoints;
          balance = ad.rewardPoints;
          adsWatched = 1;
          redemptions = [];
          _adsHistory = [{
            adId;
            title = ad.title;
            points = ad.rewardPoints;
            timestamp = now;
          }];
        };
      };
      case (?profile) {
        let newHistory = [{
          adId;
          title = ad.title;
          points = ad.rewardPoints;
          timestamp = now;
        }];
        {
          profile with
          totalPoints = profile.totalPoints + ad.rewardPoints;
          balance = profile.balance + ad.rewardPoints;
          adsWatched = profile.adsWatched + 1;
          _adsHistory = newHistory.concat(profile._adsHistory);
        };
      };
    };
    persistentProfiles.add(caller, currentProfile);
  };

  public shared ({ caller }) func redeemPoints(_type : RedemptionType, amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can redeem points");
    };

    let profile = switch (persistentProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?p) { p };
    };

    if (amount > profile.balance) {
      Runtime.trap("Insufficient balance");
    };

    let newRedemption : Redemption = {
      id = currentRedemptionId;
      _type;
      amount;
      timestamp = Time.now();
    };
    currentRedemptionId += 1;
    let updatedRedemptions = [newRedemption].concat(profile.redemptions);
    let updatedProfile = {
      profile with
      balance = profile.balance - amount;
      redemptions = updatedRedemptions;
    };
    persistentProfiles.add(caller, updatedProfile);
  };

  public query ({ caller }) func getLeaderboard() : async [Profile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let profilesArray = persistentProfiles.values().toArray().sort();
    let size = profilesArray.size();
    let limit = if (size < 10) { size } else { 10 };
    if (limit == 0) { [] } else { profilesArray.sliceToArray(0, limit) };
  };

  public shared ({ caller }) func addAd(title : Text, description : Text, duration : Nat, rewardPoints : Nat, category : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let ad : Ad = {
      id = currentAdId;
      title;
      description;
      duration;
      rewardPoints;
      category;
      isActive = true;
    };
    persistentAds.add(currentAdId, ad);
    currentAdId += 1;
    ad.id;
  };

  public shared ({ caller }) func updateAd(id : Nat, title : Text, description : Text, duration : Nat, rewardPoints : Nat, category : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let oldAd = switch (persistentAds.get(id)) {
      case (null) { Runtime.trap("Ad not found") };
      case (?a) { a };
    };
    let newAd : Ad = {
      id;
      title;
      description;
      duration;
      rewardPoints;
      category;
      isActive = oldAd.isActive;
    };
    persistentAds.add(id, newAd);
  };

  public shared ({ caller }) func deactivateAd(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let ad = switch (persistentAds.get(id)) {
      case (null) { Runtime.trap("Ad not found") };
      case (?a) { a };
    };
    let newAd = { ad with isActive = false };
    persistentAds.add(id, newAd);
  };

  public query ({ caller }) func getAds() : async [Ad] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    persistentAds.values().toArray();
  };
};
