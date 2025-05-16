# Sanskara AI Design Document

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Goals & Intended Audience](#goals--intended-audience)
3. [System Architecture](#system-architecture)
4. [Installation & Setup](#installation--setup)
5. [Usage Guide](#usage-guide)
6. [Best Practices](#best-practices)
7. [AI-Centric Features](#ai-centric-features)
8. [Security & Privacy](#security--privacy)
9. [Future Implementations](#future-implementations)
10. [FAQ](#faq)
11. [Contributing](#contributing)
12. [License](#license)

---

## Project Overview

**Sanskara AI** is a next-generation, AI-powered wedding planning platform. It integrates with Supabase for real-time data, provides a user-friendly dashboard, and leverages AI to optimize tasks, vendor management, and personalized suggestions.

---

## Goals & Intended Audience

| Goal                                  | Description                                                                 |
|---------------------------------------|-----------------------------------------------------------------------------|
| Seamless Wedding Planning             | Centralize all planning aspects in one dashboard.                           |
| Personalization via AI                | Use AI to suggest rituals, tasks, and vendors tailored to user preferences. |
| Real-Time Collaboration               | Enable couples, families, and planners to collaborate live.                 |
| Data Security                         | Ensure user data is private and secure.                                     |

**Intended Audience:**
- Couples planning weddings
- Professional wedding planners
- Vendors
- Developers interested in AI-driven event management

---

## System Architecture

```mermaid
graph TD;
  A[User Interface (React)] --> B[API Layer]
  B --> C[Supabase Backend]
  B --> D[AI Services]
  D --> E[Recommendation Engine]
  D --> F[Analytics & Insights]
  C --> G[Database]
```

- **Frontend:** React + TypeScript, Framer Motion, React Router
- **Backend:** Supabase (Postgres, Auth, Storage)
- **AI Layer:** Custom APIs for recommendations, NLP, and automation

---

## Installation & Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-org/Sanskara_AI.git
   ```
2. **Install dependencies:**
   ```sh
   cd sanskara-ai-weddings-planner
   npm install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
4. **Run the app:**
   ```sh
   npm run dev
   ```

---

## Usage Guide

- **Dashboard:** View wedding stats, confirmed guests, budget, tasks, and timeline.
- **Tasks:** Add, edit, and track tasks. Statuses: To Do, Doing, Done.
- **Vendors:** Manage and remove vendors. Real-time updates after actions.
- **AI Suggestions:** Get ritual and vendor recommendations based on preferences.
- **Error Handling:** UI remains responsive even if a data fetch fails.

---

## Best Practices

- Use unique keys for list rendering to avoid UI bugs.
- Always handle API errors gracefully and log them for debugging.
- Use environment variables for sensitive data.
- Keep UI components modular and reusable.
- Validate user input on both frontend and backend.

---

## AI-Centric Features

| Feature                  | Description                                                     |
|-------------------------|-----------------------------------------------------------------|
| Ritual Suggestions      | AI recommends rituals based on tradition and preferences.         |
| Vendor Matching         | Smart matching of vendors to user needs.                         |
| Task Prioritization     | AI suggests which tasks to focus on next.                        |
| Timeline Optimization   | Automated scheduling based on dependencies and deadlines.         |
| Budget Insights         | AI highlights overspending and suggests optimizations.            |

---

## Security & Privacy

- User authentication via Supabase Auth.
- Data access is scoped to authenticated users.
- No sensitive information is exposed in logs or UI.
- Follow best practices for environment variable management.

---

## Future Implementations

| Feature                    | Description                                 |
|---------------------------|---------------------------------------------|
| Mobile App                | Native iOS/Android app for planning on-the-go|
| Advanced Analytics        | Deeper insights into budget, guests, and tasks|
| Multi-language Support    | UI and AI suggestions in multiple languages  |
| AI Chatbot                | 24/7 planning assistant                     |
| Third-Party Integrations  | Payments, calendars, and more               |
| Offline Mode              | Plan without internet, sync when online      |

---

## FAQ

**Q:** Is my data secure?
**A:** Yes, all data is managed by Supabase with strict access controls.

**Q:** Can I invite others to collaborate?
**A:** Yes, real-time collaboration is supported.

**Q:** What if an API fails?
**A:** The dashboard is resilient—other data will still load, and errors are logged.

---

## Contributing

1. Fork the repo and create a new branch.
2. Follow code style guidelines and write clear commit messages.
3. Open a pull request with a detailed description.

---

## License

MIT License. See [LICENSE](../LICENSE) for details.

---

> **Designed with ❤️ by the Sanskara AI Team**
