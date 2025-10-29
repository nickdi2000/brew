# BrewTokens Start Page - Quick Guide

## 🎯 Overview
Epic, minimal dark-mode welcome page with a spinning coin animation for new venue registration.

## 🚀 Access
```
http://localhost:5644/start?email=owner@venue.com&password=securepass&venueName=The%20Golden%20Tap
```

## ✨ Features

### Visual Design
- **Huge Typography**: 6xl-7xl heading sizes for dramatic impact
- **Spinning Coin**: Animated 3D coin flip at the top (from CoinFlip.vue)
- **Dark Gradient Background**: Gray-900 to Gray-800 with ambient glowing orbs
- **Minimal UI**: No visible input fields, just elegant labels displaying info
- **Smooth Animations**: Scale transforms on hover, bounce effects on success

### Three States

#### 1. Registration View (Default)
- Spinning coin animation (scaled 150%)
- Massive "Welcome to BrewTokens" headline
- Info cards showing:
  - **Venue Name** (if provided) - 4xl bold text
  - **Email** (if provided) - 3xl semibold text
- Hidden input fields (only show if email/venue missing)
- Giant "Start My Journey" button (3xl text, hover scales up)

#### 2. Loading State
- Spinning coin with "..." value
- "Creating Magic" headline (6xl)
- "Setting up your account..." subtitle (2xl)

#### 3. Success State
- Giant green checkmark icon (32x32)
- "Welcome!" headline (7xl)
- "Your journey begins now" subtitle (3xl)
- "Enter Dashboard" button (2xl)

## 🔧 URL Parameters

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `email` | No* | Email address | `owner@venue.com` |
| `password` | Yes | Account password (hidden) | `SecurePass123` |
| `venueName` | No* | Venue/business name | `The Golden Tap` |

*Email and venueName can be filled in on the page if not provided in URL

## 📝 Usage Examples

### Full Pre-populated
```
/start?email=john@brewery.com&password=MyPass123&venueName=Gordon%20Brewhouse
```

### Email + Password Only
```
/start?email=sarah@venue.com&password=SecurePass123
```
*(User fills in venue name on page)*

### Password Only
```
/start?password=MySecretPass123
```
*(User fills in email and venue name on page)*

## 🎨 Design Specs

### Colors
- Background: `gray-900` → `gray-800` gradient
- Accent: `amber-400` / `amber-500`
- Text: `white` (headlines), `gray-300` (body), `gray-400` (labels)

### Typography Sizes
- Main Headline: `text-6xl md:text-7xl` (Welcome to BrewTokens)
- Success Headline: `text-7xl` (Welcome!)
- Info Display: `text-4xl` (venue), `text-3xl` (email)
- Button Text: `text-3xl` (Start My Journey)
- Loading Text: `text-6xl` (Creating Magic)

### Key Components
- **CoinFlip**: Imported from `@/components/CoinFlip.vue`
- **Icon**: From `@iconify/vue`
- **Toast**: From `@/plugins/toast`

## 🔐 Security Note
The password is:
- ✅ Passed via URL parameter
- ✅ Stored in component state
- ✅ NEVER displayed on screen
- ✅ Hidden in a hidden form element
- ✅ Validated (min 8 characters) before submission

## 📱 Responsive
- Mobile: Stacks vertically, scales down text sizes
- Desktop: Full epic sizing, maximum visual impact
- Centered content, maximum width constraints

## 🎭 Animation Details
- Coin spins continuously at top
- Button scales to 105% on hover
- Success checkmark bounces once
- Background orbs pulse with staggered delays
- Smooth transitions (300ms duration)

## 🔄 Flow
1. User lands on page (from email link, marketing, etc.)
2. Sees spinning coin + huge welcome message
3. Reviews their venue name and email (displayed as labels)
4. Clicks "Start My Journey" button
5. Sees "Creating Magic" loading state with spinning coin
6. Brief "Welcome!" success screen
7. Auto-redirects to admin dashboard

## 🎯 Perfect For
- Email marketing campaigns
- Referral links
- Partner onboarding
- Sales demos
- Special promotions

## 🛠️ Technical
- **Route**: `/start` (public, no auth required)
- **Component**: `fe/src/pages/Start.vue`
- **API**: Uses existing `register` Vuex action
- **Backend**: Standard `/auth/register` endpoint
- **Redirect**: To `/admin` dashboard on success

---

**Pro Tip**: The coin spins faster each time you click it! Try it during the loading state for fun. 🪙✨

