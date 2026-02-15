# 💰 SP.End - Personal Finance Simplified

**SP.End** is a modern, high-performance personal finance management application designed to give you absolute control over your spending habits with a premium, immersive user experience.

[![Latest Release](https://img.shields.io/badge/release-v1.0.0--beta-emerald?style=for-the-badge)](https://github.com/your-username/sp-end/releases/latest)

---

## ✨ Key Features

- **🚀 Smart Dashboard**: Real-time spending analytics and budget utilization at a glance.
- **📊 Interactive Analytics**: Beautifully crafted charts powered by Recharts to visualize your financial trends.
- **🎯 Goal Management**: Set, track, and achieve your financial milestones with progress visualization.
- **🏆 Rewards System**: Gamified spending habits—earn badges as you improve your financial health.
- **📱 Mobile-First Design**: A premium immersive experience with a modern **Floating Navbar** and full Android support via Capacitor.
- **🌓 Adaptive UI**: Intelligent Dark and Light modes that respect your preference across web and mobile.
- **⚡ Real-time Sync**: Powered by Supabase for instantaneous data persistence and security.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide Icons
- **Backend/Database**: Supabase
- **Mobile Foundation**: Capacitor (Android native integration)
- **Charts**: Recharts
- **Native Bridges**: @capacitor/status-bar, @capacitor/app, @capacitor/haptics

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Android Studio (for native Android testing)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/sp-end.git
   cd sp-end
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run locally:
   ```bash
   npm run dev
   ```

---

## 📱 Mobile Deployment (Android)

To run **SP.End** on your Android device:

1. Build the web project:
   ```bash
   npm run build
   ```

2. Sync with Capacitor:
   ```bash
   npx cap sync android
   ```

3. Open in Android Studio:
   ```bash
   npx cap open android
   ```

---

## 🔗 Latest Release

Download the latest Android APK or view the release notes here:
[**Download Latest Release (v1.0.0-beta)**](https://github.com/your-username/sp-end/releases/latest)

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

Developed with ❤️ by [Adarsh](https://github.com/AdarshhCodes) and [Debojeet](https://github.com/PEEXR)
