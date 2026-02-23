# Swiss Quiz Pro - Citizenship Test Preparation

A professional, local-first web application designed to help you prepare for the Swiss citizenship test (Grundkenntnistest Kanton Zürich).

## 🚀 Features

-   **Study Mode:** Browse all 350 questions with immediate access to correct answers and detailed explanations.
-   **Spaced Repetition Practice:** A "Leitner-style" learning algorithm that prioritizes questions you find difficult and schedules reviews based on your performance.
-   **Mock Exam Simulator:** A timed, 30-question simulation of the actual test with a pass/fail results screen and full review.
-   **Local-First Privacy:** All progress, statistics, and bookmarks are stored directly in your browser using IndexedDB. No server or login required.
-   **PWA Support:** Installable on iOS and Android. Works completely offline once the assets are cached.
-   **High-Quality Assets:** Cleanly extracted images for geography, flags, and heraldry questions.

## 🛠️ Tech Stack

-   **Frontend:** Vue 3 + TypeScript + Vite
-   **State Management:** Pinia
-   **Database:** Dexie.js (IndexedDB)
-   **Styles:** Modern CSS with mobile-first responsive design.
-   **Markdown:** Marked.js for rendering detailed explanations.

## 📦 Installation & Development

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Start Development Server:**
    ```bash
    npm run dev
    ```

3.  **Build for Production:**
    ```bash
    npm run build
    ```

## 🚢 Deployment

This repository is configured for automatic deployment to **GitHub Pages** via GitHub Actions. Simply push your changes to the `main` branch, and the site will be updated automatically.

## 📜 License

MIT
