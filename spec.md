# AdEarn

## Current State
New project. No existing implementation.

## Requested Changes (Diff)

### Add
- User authentication and authorization
- Ad browsing: list of available ads with title, description, duration, reward points
- Ad watching: simulated video ad player with timer countdown (user must watch full duration)
- Earnings tracking: total points balance per user
- Earnings history: log of watched ads with timestamp and points earned
- Reward redemption: users can redeem points for rewards (gift cards, cash out)
- Admin panel: add/manage ads (title, description, duration in seconds, reward points, ad video URL or placeholder)
- Leaderboard: top earners
- User profile: show username, total earned, available balance

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend: authorization component, ads CRUD, watch-ad action (validates cooldown/duplicate, credits points), earnings history, redemption requests, leaderboard query, user profile
2. Frontend: login/signup flow, dashboard with ads list, ad player modal with countdown, earnings dashboard, history table, leaderboard, admin ad management panel
