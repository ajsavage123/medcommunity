# CODEBLUER - EMR COMMUNITY

A professional platform exclusively built for EMR COMMUNITY to connect, share insights, compare compensation accurately, and seamlessly grow their clinical careers.

## 🚀 Vision

The EMR community needs a central hub for localized salary data, certification tips, and clinical leadership discussions. **CODEBLUER** consolidates these resources into one professional hub tailored specifically for those on the frontlines of pre-hospital medicine.

## 🌟 Key Features

- **Specialized Discussion Rooms** - Join localized and topic-specific rooms (e.g., Salary Discussions, Career Advice, Clinical Leadership, Certifications).
- **Anonymous Salary Insights** - Safely share and compare granular compensation data filtered by location and role.
- **Curated Career Tools** - Access specific calculators and localized protocols instantly.
- **Verified User Profiles** - Build a solid professional identity highlighting your clinical experience.
- **Real-time Live Chat** - Engage in dynamic live discussions and debriefs.

## 📝 Recent Updates

### Version 1.2 (Current)
*   **Rebranding:** Complete transition to **CODEBLUER: EMR COMMUNITY**.
*   **New Identity:** Deployed a professional **Star of Life** favicon and logo.
*   **PWA Support:** Added full-screen standalone mode for a premium native app experience.
*   **Mobile Optimizations:** Fixed keyboard-layout interactions and hardware back-button support.

## � Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub** - Ensure your code is on the `main` branch
2. **Connect to Vercel** - Go to [vercel.com](https://vercel.com) and create a new project from your GitHub repository
3. **Set Environment Variables** - In Vercel project settings, add:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase public anon key
   - `VITE_SUPABASE_PROJECT_ID` - Your Supabase project ID (optional)

4. **Deploy** - Push to GitHub and Vercel will automatically build and deploy

For detailed instructions, see [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)

### Local Development

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials in `.env.local`

3. Start the development server:
   ```bash
   npm install
   npm run dev
   ```

## �🛡 License

This project is private and strictly proprietary to CODEBLUER.
