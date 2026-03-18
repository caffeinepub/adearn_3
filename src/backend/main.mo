import Array "mo:core/Array";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


actor {
  // Types from OpenAPI
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
    videoUrl : ?Text;
  };

  type UpiWithdrawalRequest = {
    id : Nat;
    userId : Principal;
    upiId : Text;
    amount : Nat;
    status : { #pending; #approved; #rejected };
    timestamp : Int;
  };

  // Fixed reward per ad watch
  let AD_WATCH_REWARD : Nat = 100;
  // Minimum withdrawal amount
  let MIN_WITHDRAWAL : Nat = 5000;

  // Variables with persistent state
  var currentAdId = 1;
  var currentRedemptionId = 1;
  var currentUpiWithdrawalId = 1;
  let persistentProfiles = Map.empty<Principal, Profile>();
  let persistentAds = Map.empty<Nat, Ad>();
  let upiWithdrawals = Map.empty<Nat, UpiWithdrawalRequest>();

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

    // Always award fixed 100 points per ad watch
    let reward = AD_WATCH_REWARD;

    let currentProfile = switch (persistentProfiles.get(caller)) {
      case (null) {
        {
          username = caller.toText();
          totalPoints = reward;
          balance = reward;
          adsWatched = 1;
          redemptions = [];
          _adsHistory = [{
            adId;
            title = ad.title;
            points = reward;
            timestamp = now;
          }];
        };
      };
      case (?profile) {
        let newHistory = [{
          adId;
          title = ad.title;
          points = reward;
          timestamp = now;
        }];
        {
          profile with
          totalPoints = profile.totalPoints + reward;
          balance = profile.balance + reward;
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

  public shared ({ caller }) func addAd(title : Text, description : Text, duration : Nat, rewardPoints : Nat, category : Text, videoUrl : ?Text) : async Nat {
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
      videoUrl;
    };
    persistentAds.add(currentAdId, ad);
    currentAdId += 1;
    ad.id;
  };

  public shared ({ caller }) func updateAd(id : Nat, title : Text, description : Text, duration : Nat, rewardPoints : Nat, category : Text, videoUrl : ?Text) : async () {
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
      videoUrl;
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

  // UPI Withdrawal Methods

  public shared ({ caller }) func submitUpiWithdrawal(upiId : Text, amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit withdrawals");
    };

    let profile = switch (persistentProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?p) { p };
    };

    if (amount < MIN_WITHDRAWAL) {
      Runtime.trap("Minimum withdrawal is 5000 points");
    };

    if (amount > profile.balance) {
      Runtime.trap("Insufficient balance");
    };

    let newRequest : UpiWithdrawalRequest = {
      id = currentUpiWithdrawalId;
      userId = caller;
      upiId;
      amount;
      status = #pending;
      timestamp = Time.now();
    };
    currentUpiWithdrawalId += 1;
    upiWithdrawals.add(newRequest.id, newRequest);

    // Deduct balance immediately
    let updatedProfile = { profile with balance = profile.balance - amount };
    persistentProfiles.add(caller, updatedProfile);
  };

  public query ({ caller }) func getMyUpiWithdrawals() : async [UpiWithdrawalRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view withdrawals");
    };

    let withdrawalsArray = upiWithdrawals.values().toArray();
    let filtered = withdrawalsArray.filter(
      func(w) {
        w.userId == caller;
      }
    );
    filtered;
  };

  public query ({ caller }) func getAllUpiWithdrawals() : async [UpiWithdrawalRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all withdrawals");
    };
    upiWithdrawals.values().toArray();
  };

  public shared ({ caller }) func updateUpiWithdrawalStatus(id : Nat, status : { #pending; #approved; #rejected }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update withdrawal status");
    };

    let request = switch (upiWithdrawals.get(id)) {
      case (null) { Runtime.trap("Withdrawal request not found") };
      case (?r) { r };
    };

    // Only allow status change if current status is pending
    if (request.status != #pending) {
      Runtime.trap("Cannot update a non-pending withdrawal");
    };

    let updatedRequest = { request with status };
    upiWithdrawals.add(id, updatedRequest);

    // If rejected, refund the amount to user's profile
    if (status == #rejected) {
      let _ = switch (persistentProfiles.get(request.userId)) {
        case (null) { () }; // If user not found, just ignore refund
        case (?p) {
          let updatedProfile = { p with balance = p.balance + request.amount };
          persistentProfiles.add(request.userId, updatedProfile);
        };
      };
    };
  };
};
