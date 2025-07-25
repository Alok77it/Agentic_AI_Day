# CityPulse App - Smart City Report Management

A modern React application for city infrastructure reporting with real-time analytics and intelligent features.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

The app will run on http://localhost:4200

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Cloud Platform account (for Gemini AI)
- Firebase project setup

## 🔧 Environment Setup

Create a `.env` file in the root directory:

```env
# Supabase Configuration (Already Configured)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini AI Configuration
VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_service_account@your_project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
```

## 🤖 Google Gemini AI Integration

### Setup Steps:

1. **Get API Key:**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env` file as `VITE_GOOGLE_AI_API_KEY`

2. **Integration Points:**

#### A. Report Analysis (Recommended)
**File:** `src/components/ReportForm.tsx`
**Location:** Line ~400-450 (in form submission)
**Purpose:** Analyze report descriptions for severity, categorization, and sentiment

```typescript
// Add this service file
// src/services/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY);

export const analyzeReport = async (description: string, type: string) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `Analyze this city infrastructure report:
  Type: ${type}
  Description: ${description}
  
  Provide a JSON response with:
  - severity: (low|medium|high|critical)
  - category: specific subcategory
  - urgency_score: 1-10
  - estimated_cost: rough estimate
  - recommended_action: brief action plan`;
  
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
};
```

**Integration in ReportForm.tsx:**
```typescript
// In handleSubmit function around line 400
const analysisResult = await analyzeReport(reportData.description, reportData.type);
reportData.aiAnalysis = analysisResult;
```

#### B. Admin Dashboard Analytics
**File:** `src/components/AdminDashboard.tsx`
**Location:** Line ~100-150 (dashboard statistics)
**Purpose:** Generate insights and trends from report data

```typescript
// Add to AdminDashboard.tsx
const generateInsights = async (reports: Report[]) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `Analyze these city reports and provide insights:
  ${JSON.stringify(reports.slice(0, 10))}
  
  Generate:
  - Top 3 priority areas
  - Trend analysis
  - Resource allocation suggestions`;
  
  const result = await model.generateContent(prompt);
  return result.response.text();
};
```

#### C. Smart Notifications
**File:** `src/components/NotificationPanel.tsx`
**Location:** Line ~50-100 (notification generation)
**Purpose:** Generate contextual notifications based on report patterns

### Required Package:
```bash
npm install @google/generative-ai
```

## 🔥 Firebase Integration

### Setup Steps:

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create new project
   - Enable Authentication, Firestore, and Storage

2. **Get Configuration:**
   - Project Settings → General → Your apps
   - Add web app and copy config values

3. **Integration Points:**

#### A. Authentication Enhancement
**File:** `src/utils/firebase/auth.ts` (Create new)
**Purpose:** Enhanced authentication with Firebase Auth

```typescript
// src/utils/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

#### B. Real-time Data Sync
**File:** `src/App.tsx`
**Location:** Line ~150-200 (loadReports function)
**Purpose:** Real-time report updates

```typescript
// Replace loadReports with Firebase real-time listener
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';

const setupRealtimeReports = () => {
  const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const reportsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setReports(reportsData);
  });
};
```

#### C. File Upload Enhancement
**File:** `src/App.tsx`
**Location:** Line ~425-445 (uploadFile function)
**Purpose:** Enhanced file uploads with Firebase Storage

```typescript
// Replace uploadFile function
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const uploadFile = async (file: File): Promise<string> => {
  const storageRef = ref(storage, `reports/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};
```

#### D. Push Notifications
**File:** `src/services/notifications.ts` (Create new)
**Purpose:** Push notifications for report updates

```typescript
// src/services/notifications.ts
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

export const initializeNotifications = async () => {
  const messaging = getMessaging();
  
  const token = await getToken(messaging, {
    vapidKey: 'your_vapid_key'
  });
  
  onMessage(messaging, (payload) => {
    // Handle foreground notifications
    console.log('Received notification:', payload);
  });
  
  return token;
};
```

### Required Packages:
```bash
npm install firebase
```

## 📁 Key Files for API Integration

### Priority Integration Files:
1. **`src/components/ReportForm.tsx`** - Main form with AI analysis
2. **`src/components/AdminDashboard.tsx`** - Analytics and insights  
3. **`src/App.tsx`** - Core app logic and data management
4. **`src/components/NotificationPanel.tsx`** - Smart notifications

### New Files to Create:
1. **`src/services/gemini.ts`** - Gemini AI service
2. **`src/utils/firebase/config.ts`** - Firebase configuration
3. **`src/utils/firebase/auth.ts`** - Firebase auth helpers
4. **`src/services/notifications.ts`** - Push notification service

## 🏗️ Architecture Overview

```
src/
├── components/           # React components
│   ├── AdminDashboard.tsx   # 🔥 Firebase + 🤖 Gemini
│   ├── ReportForm.tsx       # 🤖 Gemini Analysis
│   └── NotificationPanel.tsx # 🔥 Firebase + 🤖 Gemini
├── services/            # API services
│   ├── gemini.ts           # 🤖 NEW: Gemini AI service
│   └── notifications.ts    # 🔥 NEW: Firebase notifications
├── utils/
│   ├── firebase/           # 🔥 NEW: Firebase utilities
│   └── supabase/          # Existing Supabase (keep)
└── App.tsx              # 🔥 Firebase real-time updates
```

## 🚀 Deployment

### Environment Variables for Production:
Set these in your deployment platform (Vercel, Netlify, etc.):

```bash
# Google AI
VITE_GOOGLE_AI_API_KEY=your_production_key

# Firebase
VITE_FIREBASE_API_KEY=your_production_key
VITE_FIREBASE_AUTH_DOMAIN=your_production_domain
VITE_FIREBASE_PROJECT_ID=your_production_project
# ... other Firebase vars
```

## 📖 Usage Examples

### Report Analysis with Gemini:
```typescript
// In ReportForm.tsx
const handleSubmit = async (data) => {
  const analysis = await analyzeReport(data.description, data.type);
  console.log('AI Analysis:', analysis);
  // Submit with enhanced data
};
```

### Real-time Updates with Firebase:
```typescript
// In App.tsx useEffect
useEffect(() => {
  const unsubscribe = setupRealtimeReports();
  return () => unsubscribe();
}, []);
```

## 🔧 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📚 Documentation

- [Google Gemini AI Docs](https://ai.google.dev/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Supabase Docs](https://supabase.com/docs) (current backend)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Add API integrations as needed
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
