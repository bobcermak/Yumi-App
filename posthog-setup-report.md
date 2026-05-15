<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Yumi calorie tracking app. The following changes were made:

- **`app.config.js`** (new) — Converted from `app.json` to `app.config.js` to support environment variable injection for PostHog keys via `extras`.
- **`.env`** (new) — PostHog project token and host set as environment variables.
- **`lib/config/posthog.ts`** (new) — PostHog client configured with `expo-constants` to read keys from `app.config.js` extras. Includes batching, lifecycle capture, and feature flag settings.
- **`app/_layout.tsx`** — Added `PostHogProvider` wrapping the app and manual screen tracking via `posthog.screen()` using `usePathname`/`useGlobalSearchParams`.
- **`contexts/AuthContext.tsx`** — Added `posthog.identify()` on session restore and login; `posthog.capture()` for `user_signed_up`, `onboarding_completed`, `user_logged_in`, `user_logged_out`; `posthog.reset()` on sign-out.
- **`contexts/SearchItemContext.tsx`** — Added `posthog.capture()` for `meal_logged` and `food_favorite_toggled`.
- **`contexts/SearchContext.tsx`** — Wrapped `submitSearch` to capture `food_searched` with query length and filters.
- **`contexts/IndexContext.tsx`** — Added `posthog.capture()` for `calorie_goal_updated`, `water_intake_updated`, and `meal_deleted`.

| Event | Description | File |
|---|---|---|
| `user_signed_up` | User completes registration | `contexts/AuthContext.tsx` |
| `onboarding_completed` | User finishes onboarding with goals and profile | `contexts/AuthContext.tsx` |
| `user_logged_in` | User logs in with email/password | `contexts/AuthContext.tsx` |
| `user_logged_out` | User signs out of the app | `contexts/AuthContext.tsx` |
| `meal_logged` | User records a food item to a meal | `contexts/SearchItemContext.tsx` |
| `food_favorite_toggled` | User adds or removes a food from favorites | `contexts/SearchItemContext.tsx` |
| `food_searched` | User submits a food search query | `contexts/SearchContext.tsx` |
| `calorie_goal_updated` | User changes their daily calorie limit | `contexts/IndexContext.tsx` |
| `water_intake_updated` | User updates daily water intake | `contexts/IndexContext.tsx` |
| `meal_deleted` | User removes a logged meal | `contexts/IndexContext.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/project/180102/dashboard/684385)
- [User Activation Funnel](/project/180102/insights/yuMcLKAx) — Signup → Onboarding → First meal logged
- [Meals Logged Per Day](/project/180102/insights/Wj73Hv4j) — Daily engagement metric
- [Food Search vs Meal Logged Conversion](/project/180102/insights/poUyjwpC) — Search-to-log conversion
- [User Signups Over Time](/project/180102/insights/ilCh7BfH) — Acquisition trend
- [Meal Deletion Rate (Churn Signal)](/project/180102/insights/NEXZ0vur) — Logged vs deleted meals

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>