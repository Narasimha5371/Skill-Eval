# Skilleval AI - Subscriptions & Cleanup Walkthrough

## Summary of Accomplishments
1.  **Project Cleanup**: Removed 9 redundant test files (`test-*.js`, `test.pdf`, etc.) and the unused `clerk-nextjs` folder to streamline the codebase.
2.  **Tiered Subscription System**:
    *   **Guest**: Up to 3 free resume uploads (tracked by IP).
    *   **Candidate (150 rs)**: 30 resumes/day, 2500/month.
    *   **Manager & Candidate (500 rs)**: 1 Manager + 10,000 Candidates (10 uploads/day each).
    *   **Enterprise (1000 rs)**: Up to 50 Managers + 50,000 Candidates + Rank/Proficiency tracking.
3.  **Manager Control**: Added ability for Managers to invite candidates via email and toggle score visibility for their candidates.
4.  **UI/UX Enhancements**:
    *   Added usage tracking badges in the Candidate Dashboard.
    *   Implemented Enterprise rank display for candidates (if allowed).
    *   Integrated Clerk authentication throughout the application.
    *   Created a "Test Completed" page that respects Manager visibility settings.

## Technical Changes
- **Database**: Updated Prisma schema with `SubscriptionTier`, usage tracking, and manager-candidate relationships.
- **API**:
  - `/api/resumes/upload`: Enforces all usage limits and guest tracking.
  - `/api/manager/candidates`: Handles candidate invitations, rank calculation, and visibility settings.
  - `/api/user/me`: Syncs Clerk users and provides tiered limit information to the frontend.
- **Frontend**:
  - Updated `Navbar` with Clerk `UserButton`.
  - Built `ManagerDashboard` with invitation and settings controls.
  - Built `CandidateDashboard` with limit enforcement and restricted views.

## Verification Proof
- Removed files are gone from the file system.
- Prisma schema generated successfully.
- API endpoints handle authentication and usage limits as specified.
- UI elements dynamically update based on user subscription tier.
