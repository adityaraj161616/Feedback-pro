# ⚡ FeedbackPro - Advanced AI-Powered Feedback Platform

![FeedbackPro Hero Image](https://plus.unsplash.com/premium_photo-1683134474181-8b88c82b6aa8?q=80&w=1177&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)

FeedbackPro is a cutting-edge, full-stack feedback collection platform designed for modern teams. It empowers businesses to collect, analyze, and act on customer feedback with real-time insights, AI-powered sentiment analysis, and beautiful, customizable forms. Built with a focus on performance, security, and user experience, FeedbackPro provides a comprehensive solution for understanding your users better.

## ✨ Features

FeedbackPro comes packed with a wide array of features to streamline your feedback collection process:

### Core Platform Features
*   **Dynamic Form Builder**: A drag-and-drop interface to create custom feedback forms with various field types (text, textarea, rating, emoji, select, file upload).
*   **Live Form Preview**: Instantly see how your forms will look on desktop and mobile devices as you build them.
*   **Public Feedback Forms**: Shareable links for collecting responses from your users on beautifully animated, responsive pages.
*   **User Dashboard**: Personalized dashboard for users to view their forms, recent feedback, and key statistics.
*   **Responsive Design**: Optimized for seamless experience across all devices.
*   **GSAP Animations**: Smooth and engaging animations for a delightful user experience, including video mask reveals, typewriter effects, and magnetic button interactions.

### AI Integration
*   **AI Sentiment Analysis**: Integrates with Google Gemini AI to automatically detect sentiment (positive, neutral, negative) from text responses.
*   **Emotion Detection**: Identifies key emotions expressed in feedback.
*   **Keyword Extraction**: Highlights important keywords influencing sentiment.
*   **Confidence Scoring**: Provides a confidence level for the AI's sentiment analysis.
*   **Feedback Summarization**: Generates brief summaries of overall sentiment.

### Real-time Capabilities
*   **Real-time Notifications**: Instant alerts for new feedback submissions via toast notifications.
*   **Socket.io Integration**: Backend setup for real-time communication, ready for live updates on dashboards and forms.
*   **Live Feedback Streaming**: Simulate real-time feedback updates on the dashboard for dynamic insights.

### Authentication & Security
*   **NextAuth.js**: Secure authentication system supporting Google OAuth.
*   **Role-Based Access Control (RBAC)**: Differentiates between `user` and `admin` roles, protecting sensitive routes and data.
*   **MongoDB Integration**: Persistent storage for forms, feedback, and user data.

### Admin Dashboard
*   **Comprehensive Overview**: Centralized dashboard for administrators to manage all forms, users, and feedback.
*   **Global Statistics**: View total feedback, active forms, total users, and average sentiment across the platform.
*   **Detailed Feedback Table**: Browse, filter, and manage all submitted feedback.
*   **Sentiment Trend Charts**: Visualizations of sentiment distribution and trends over time.
*   **Data Export**: Export all feedback data to CSV format for external analysis.

### Design & UI/UX
*   **Modern Aesthetic**: Clean, dark theme with a vibrant blue and white color palette.
*   **shadcn/ui Components**: Utilizes a robust set of accessible and customizable UI components.
*   **Tailwind CSS**: For rapid and consistent styling.

## 🛠️ Tech Stack

*   **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Components, Client Components)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
*   **Animations**: [GSAP (GreenSock Animation Platform)](https://greensock.com/gsap/)
*   **Authentication**: [NextAuth.js](https://next-auth.js.org/)
*   **Database**: [MongoDB](https://www.mongodb.com/)
*   **Real-time**: [Socket.io](https://socket.io/)
*   **AI**: [Google Gemini API](https://ai.google.dev/gemini-api)
*   **Email**: [Nodemailer](https://nodemailer.com/about/)
*   **Charting**: [Recharts](https://recharts.org/)
*   **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
*   **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

## 🚀 Getting Started

Follow these steps to get FeedbackPro up and running on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:
*   [Node.js](https://nodejs.org/en/) (v18.x or higher)
*   [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
*   A [MongoDB](https://www.mongodb.com/docs/manual/installation/) instance (local or cloud-hosted like MongoDB Atlas)

### Installation

1.  **Clone the repository:**
    \`\`\`bash
    git clone https://github.com/your-username/feedbackpro.git
    cd feedbackpro
    \`\`\`
2.  **Install dependencies:**
    \`\`\`bash
    npm install
    # or
    yarn install
    \`\`\`

### Environment Variables

FeedbackPro relies on several environment variables for its functionality. Create a `.env.local` file in the root of your project and populate it with the following:

\`\`\`env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# MongoDB
MONGODB_URI=mongodb://localhost:27017/feedbackpro

# AI/Sentiment Analysis
GEMINI_API_KEY=your-gemini-api-key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Socket.io (Optional, for local development)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Vercel Deployment (for production)
VERCEL_URL=https://your-vercel-app-url.vercel.app
\`\`\`

#### How to Get Your Keys:

1.  **`NEXTAUTH_URL`**:
    *   For local development, set this to `http://localhost:3000`.
    *   For production, set this to your deployed Vercel URL (e.g., `https://your-app.vercel.app`).
2.  **`NEXTAUTH_SECRET`**:
    *   Generate a strong, random string. You can use `openssl rand -base64 32` in your terminal or a similar online tool. This is crucial for securing your NextAuth.js sessions.
3.  **`GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`**:
    *   Go to the [Google Cloud Console](https://console.cloud.google.com/).
    *   Create a new project (if you don't have one).
    *   Navigate to "APIs & Services" > "Credentials".
    *   Click "Create Credentials" > "OAuth client ID".
    *   Select "Web application".
    *   Add `http://localhost:3000` and `http://localhost:3001` (for Socket.io server) as Authorized JavaScript origins.
    *   Add `http://localhost:3000/api/auth/callback/google` and `https://your-vercel-app-url.vercel.app/api/auth/callback/google` as Authorized redirect URIs.
    *   Your Client ID and Client Secret will be displayed.
4.  **`MONGODB_URI`**:
    *   If using **MongoDB Atlas**: Log in, create a new cluster, and follow their instructions to get the connection string (usually starts with `mongodb+srv://`). Remember to replace `<username>` and `<password>` with your database user credentials.
    *   If using **local MongoDB**: It's typically `mongodb://localhost:27017/feedbackpro`.
5.  **`GEMINI_API_KEY`**:
    *   Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   Create a new API key.
6.  **`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`**:
    *   These are for sending emails (e.g., feedback notifications, welcome emails).
    *   **For Gmail**:
        *   `SMTP_HOST`: `smtp.gmail.com`
        *   `SMTP_PORT`: `587`
        *   `SMTP_USER`: Your Gmail address (e.g., `your-email@gmail.com`)
        *   `SMTP_PASS`: You'll need to generate an **App Password** for your Google account. Go to your Google Account Security settings, enable 2-Step Verification, then go to App Passwords and generate a new one. **Do NOT use your regular Gmail password.**
    *   For other email providers, consult their documentation for SMTP settings.
7.  **`NEXT_PUBLIC_SOCKET_URL`**:
    *   For local development, set this to `http://localhost:3001` (assuming your Socket.io server runs on port 3001).
    *   For production, this should be the URL where your Socket.io server is deployed.
8.  **`VERCEL_URL`**:
    *   This variable is automatically set by Vercel during deployment. For local development, you can omit it or set it to `http://localhost:3000`.

### Running Locally

1.  **Start the Next.js development server:**
    \`\`\`bash
    npm run dev
    # or
    yarn dev
    \`\`\`
    The application will be accessible at `http://localhost:3000`.

2.  **Start the Socket.io server (if you have a separate one):**
    *   *Note: The current setup assumes Socket.io is integrated within the Next.js API routes or a separate simple Node.js server. If you have a dedicated Socket.io server, ensure it's running on `http://localhost:3001` or the port specified in `NEXT_PUBLIC_SOCKET_URL`.*

## 🌐 Deployment

This project is designed for easy deployment to [Vercel](https://vercel.com/).

1.  **Connect your GitHub repository** to Vercel.
2.  **Add all environment variables** from your `.env.local` file to your Vercel project settings (under "Environment Variables"). Ensure `NEXTAUTH_URL` is set to your Vercel deployment URL (e.g., `https://your-app.vercel.app`).
3.  Vercel will automatically build and deploy your application.

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License.
