Okay, here is a comprehensive, self-contained design document for Sanskara AI, incorporating Supabase for authentication and data storage, FastAPI for the backend, React for the frontend, and AutoGen for AI orchestration, with AI agents having tool-based access to all application features.

**Sanskara AI: Comprehensive Product Design Document**

**1. Introduction & Overview**

Sanskara AI is a web-based platform designed to be a virtual wedding planner specializing in Hindu weddings. It aims to blend cultural knowledge with modern planning tools, assisting couples in navigating rituals, finding vendors, managing tasks, budgets, guest lists, timelines, and visualizing their event aesthetic. The core experience revolves around a dashboard providing access to various planning modules and an AI assistant powered by AutoGen, capable of understanding user requests and interacting with all application features via defined tools.

**2. Core Principles**

*   **Unified Backend:** A single Python FastAPI backend serves all API requests.
*   **Integrated Data & Auth:** Supabase provides PostgreSQL database, file storage (for mood boards), and user authentication (sign-up, sign-in, session management).
*   **API-Driven Frontend:** A React (Vite, shadcn-ui, Tailwind) single-page application interacts with the backend via a RESTful API.
*   **Comprehensive AI Assistance:** AutoGen orchestrates multiple AI agents, equipped with tools to access and manipulate *all* user data and application features (tasks, budget, vendors, etc.) via the backend API layer.
*   **Secure & User-Scoped Data:** All user data is tied to their authenticated Supabase identity, ensuring privacy and proper data access within the backend.

**3. Overall Architecture**

The system follows a client-server model with integrated cloud services:

1.  **User:** Interacts with the React Frontend via a web browser.
2.  **Frontend (React):** Handles UI rendering, user input, and interacts with Supabase JS SDK for authentication. Makes authenticated API calls to the Backend using Supabase JWTs.
3.  **Backend (FastAPI):** Receives API requests, verifies Supabase JWTs using the Supabase Python client, executes business logic, orchestrates AI tasks via AutoGen, and interacts with Supabase Database/Storage.
4.  **AI Orchestration (AutoGen):** Runs within the Backend. Manages conversational flow between specialized AI agents which use defined Python tools to perform actions.
5.  **Supabase Cloud:** Provides Authentication service, PostgreSQL Database for data persistence, and Storage for file uploads (e.g., mood board images).
6.  **External Services:** Includes the LLM API (e.g., OpenAI, Anthropic) used by AutoGen agents.

```mermaid
graph TD
    subgraph user_environment ["User Environment"]
        UserBrowser[User Browser]
    end

    subgraph frontend_layer ["Frontend - React Vite ShadcnUI Tailwind"]
        direction LR
        WebApp[Sanskara AI Web App]
        UIComponents[UI Components Shadcn]
        StateMgmt[State Management Context/Zustand]
        Routing[React Router]
        APIService[API Service Client axios/fetch]
        SupabaseSDK[Supabase JS SDK (@supabase/supabase-js)]
    end

    subgraph backend_layer ["Backend - Python FastAPI on Cloud Host"]
        direction TB
        APIGateway[API Gateway / Router FastAPI]

        subgraph core_services ["Core Services / CRUD Logic"]
            direction LR
            UserService[User CRUD]
            VendorService[Vendor CRUD]
            UserVendorService[UserVendor CRUD]
            TaskService[Task CRUD]
            MoodboardService[Moodboard CRUD]
            BudgetService[Budget CRUD]
            GuestService[Guest CRUD]
            TimelineService[Timeline CRUD]
            ChatService[Chat Session/Message CRUD & AI Orchestration]
        end

        subgraph ai_orchestration ["AI Orchestration - AutoGen Framework"]
            direction TB
            AutoGenManager[AutoGen GroupChat Manager]
            subgraph agents ["Agents"]
                direction LR
                PlannerAgent[Planner Agent]
                VendorAgent[Vendor Agent]
                TaskAgent[Task Agent]
                BudgetAgent[Budget Agent]
                GuestAgent[Guest Agent]
                TimelineAgent[Timeline Agent]
                MoodboardAgent[Moodboard Agent]
                RitualAgent[Ritual Expert Agent]
            end
            Tools[Agent Tools Python Functions Wrapping Core Services]
        end

        DBRepo[Database Interaction Layer Supabase-py]
        Security[Security Middleware Supabase JWT Auth]
        SupabaseClientPy[Supabase Python Client (supabase-py)]

    end

    subgraph data_persistence ["Data Persistence - Supabase Cloud"]
        direction TB
        SupabaseDB["Supabase PostgreSQL DB"]
        SupabaseStorage[Supabase Storage Images]
    end

    subgraph external_services ["External Services"]
        direction TB
        SupabaseAuth[Supabase Authentication Service]
        LLM_API[LLM API OpenAI/Anthropic/Google]
    end

    %% Frontend Interactions
    UserBrowser -- Interacts with --> WebApp
    WebApp -- Uses --> UIComponents
    WebApp -- Uses --> StateMgmt
    WebApp -- Uses --> Routing
    WebApp -- Makes Calls via --> APIService
    WebApp -- Uses --> SupabaseSDK

    %% Frontend to External Auth
    SupabaseSDK -- Auth Flow --> SupabaseAuth

    %% Frontend to Backend API
    APIService -- HTTPS API Calls (with Supabase JWT) --> APIGateway

    %% Backend Internal Flow
    APIGateway -- Routes to Handlers in --> core_services
    APIGateway -- Uses --> Security
    Security -- Verifies Token via --> SupabaseClientPy
    SupabaseClientPy -- Validate JWT with --> SupabaseAuth
    core_services -- Use --> DBRepo
    ChatService -- Initiates/Manages --> AutoGenManager

    %% AutoGen Flow
    AutoGenManager -- Coordinates --> agents
    agents -- Use --> Tools
    Tools -- Call Functions within --> core_services  // Tools wrap CRUD/business logic
    Tools -- Access LLM via --> LLM_API

    %% Backend to Data Layer
    DBRepo -- "DB Ops / Storage Ops via SupabaseClientPy" --> SupabaseDB & SupabaseStorage

    %% Styling
    classDef frontend fill:#f9f,stroke:#333,stroke-width:2px;
    classDef backend fill:#ccf,stroke:#333,stroke-width:2px;
    classDef data fill:#9cf,stroke:#333,stroke-width:2px;
    classDef external fill:#ffc,stroke:#333,stroke-width:2px;
    classDef user fill:#eee,stroke:#333,stroke-width:2px;
    classDef ai fill:#cfc,stroke:#333,stroke-width:1px;

    class UserBrowser user;
    class WebApp,UIComponents,StateMgmt,Routing,APIService,SupabaseSDK frontend;
    class APIGateway,UserService,VendorService,UserVendorService,TaskService,MoodboardService,BudgetService,GuestService,TimelineService,ChatService,DBRepo,Security,SupabaseClientPy backend;
    class AutoGenManager,PlannerAgent,VendorAgent,TaskAgent,BudgetAgent,GuestAgent,TimelineAgent,MoodboardAgent,RitualAgent,Tools ai;
    class SupabaseDB,SupabaseStorage data;
    class SupabaseAuth,LLM_API external;
    class core_services,ai_orchestration,agents backend;
```

**4. Database Schema (Supabase PostgreSQL)**

*   Extensions required: `uuid-ossp`, `pg_trgm`.
*   All tables use UUIDs as primary keys.
*   Foreign keys link related tables, ensuring data integrity.
*   User-specific data tables have a `user_id` foreign key linking to the `users` table.

```sql
-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION btree_gin;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Users Table (Links Supabase Auth to Application Profile)
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Internal App User ID
    supabase_auth_uid UUID UNIQUE NOT NULL,             -- Supabase Auth User ID
    email VARCHAR(255) UNIQUE NOT NULL,                 -- Synced from Supabase Auth
    display_name VARCHAR(255),                          -- User Profile Name
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    -- Wedding Details
    wedding_date DATE,
    wedding_location TEXT,
    wedding_tradition TEXT,
    preferences JSONB -- { "budget_min": 5000, "budget_max": 10000, ... }
);
CREATE INDEX idx_users_supabase_auth_uid ON users (supabase_auth_uid);

-- Vendors Table (Global Vendor Directory)
CREATE TABLE vendors (
    vendor_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_name VARCHAR(255) NOT NULL,
    vendor_category VARCHAR(100) NOT NULL, -- 'Venue', 'Photographer', etc.
    contact_email VARCHAR(255),
    phone_number VARCHAR(50),
    website_url TEXT,
    address JSONB, -- {"full_address": "", "city": "", ...}
    pricing_range JSONB, -- {"min": 5000, "max": 15000, ...}
    rating FLOAT CHECK (rating >= 0 AND rating <= 5),
    description TEXT,
    portfolio_image_urls TEXT[], -- URLs to Supabase Storage
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_vendor_category ON vendors (vendor_category);
CREATE INDEX idx_vendor_city ON vendors USING gin ((address ->> 'city'));
CREATE INDEX idx_gin_vendor_name_trgm ON vendors USING gin (vendor_name gin_trgm_ops);

-- User Vendors Table (User's selected/tracked vendors)
CREATE TABLE user_vendors (
    user_vendor_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    vendor_name TEXT NOT NULL,
    vendor_category VARCHAR(100) NOT NULL,
    contact_info TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'contacted', -- 'contacted', 'booked', 'confirmed', 'pending'
    booked_date DATE,
    notes TEXT,
    linked_vendor_id UUID REFERENCES vendors(vendor_id) NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_user_vendors_user_id ON user_vendors (user_id);

-- Chat Sessions Table
CREATE TABLE chat_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    summary TEXT NULL
);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions (user_id);

-- Chat Messages Table
CREATE TABLE chat_messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system', 'tool'
    sender_name VARCHAR(100) NOT NULL, -- Specific agent or user name
    content JSONB NOT NULL, -- Structured content: {"type": "text", "text": "..."} or {"type": "vendor_card", "data": {...}}
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_chat_message_session_id_ts ON chat_messages (session_id, timestamp);

-- Tasks Table
CREATE TABLE tasks (
    task_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_complete BOOLEAN DEFAULT FALSE,
    due_date DATE,
    priority VARCHAR(10) DEFAULT 'medium', -- 'low', 'medium', 'high'
    category VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_task_user_id_status ON tasks (user_id, is_complete);
CREATE TABLE tasks (
    task_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    is_complete BOOLEAN DEFAULT FALSE,
    due_date DATE,
    category VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_task_user_id_status ON tasks (user_id, is_complete);

-- Mood Boards Table
CREATE TABLE mood_boards (
    mood_board_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT 'Wedding Mood Board',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_mood_board_user_id ON mood_boards (user_id);

-- Mood Board Items Table
CREATE TABLE mood_board_items (
    item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mood_board_id UUID NOT NULL REFERENCES mood_boards(mood_board_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL, -- URL to Supabase Storage
    note TEXT,
    category VARCHAR(100) DEFAULT 'Decorations', -- 'Decorations', 'Bride', 'Groom'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_mood_board_item_board_id ON mood_board_items (mood_board_id);

-- Budget Items Table
CREATE TABLE budget_items (
    item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    item_name TEXT NOT NULL, -- "Venue Deposit"
    category VARCHAR(100) NOT NULL, -- 'Venue', 'Catering', etc.
    amount DECIMAL(12, 2) NOT NULL,
    vendor_name TEXT,
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Paid'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_budget_item_user_id ON budget_items (user_id);

-- Guest List Table
CREATE TABLE guest_list (
    guest_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    guest_name TEXT NOT NULL,
    contact_info TEXT, -- Email or Phone
    relation TEXT, -- "Brother", "Friend"
    side VARCHAR(50), -- 'Groom', 'Bride', 'Both'
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Invited', 'Confirmed', 'Declined'
    dietary_requirements TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_guest_list_user_id ON guest_list (user_id);

-- Timeline Events Table
CREATE TABLE timeline_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    event_name TEXT NOT NULL, -- "Mehndi Ceremony"
    event_date_time TIMESTAMPTZ NOT NULL,
    location TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_timeline_events_user_id_datetime ON timeline_events (user_id, event_date_time);
```

**5. Backend Design (FastAPI)**

*   **Framework:** FastAPI
*   **Authentication:** Supabase JWT verification middleware.
*   **Database Access:** `supabase-py` client for interacting with Supabase PostgreSQL and Storage.
*   **AI Orchestration:** `pyautogen` library.
*   **Structure:**
    *   `main.py`: App entry point, middleware, router includes.
    *   `core/config.py`: Load environment variables (Supabase URL/Key, LLM keys).
    *   `core/dependencies.py`: FastAPI dependencies (e.g., `get_current_user_id` from verified JWT).
    *   `db/supabase_client.py`: Initialize Supabase client.
    *   `db/repository.py`: Contains data access functions using `supabase-py` (e.g., `UserRepository`, `TaskRepository`).
    *   `schemas/`: Pydantic models for API request/response validation.
    *   `api/`: Routers for different features (`users.py`, `tasks.py`, `chat.py`, etc.).
    *   `services/`: Business logic layer (can be simple or more complex depending on feature).
    *   `ai/`: AutoGen components:
        *   `agents.py`: Agent definitions (`PlannerAgent`, `TaskAgent`, etc.).
        *   `tools.py`: Tool definitions (functions wrapping repository/service calls).
        *   `chat_manager.py`: GroupChat setup and main chat handling logic.
    *   `auth/middleware.py`: JWT verification logic.

*   **Authentication Flow (Middleware):**
    1.  Extract `Authorization: Bearer <token>` header.
    2.  Use `supabase_client.auth.get_user(token)` to verify JWT with Supabase Auth service.
    3.  If valid, get `supabase_auth_uid` from the user object.
    4.  Call `UserRepository.get_or_create_by_supabase_uid(supabase_auth_uid, email)` to fetch the internal `user_id` (creating the user profile if it's their first API call).
    5.  Store the internal `user_id` in the request state (e.g., `request.state.user_id`).
    6.  If invalid token or error, raise `HTTPException(status_code=401)`.

*   **Dependency Injection:** API route functions use a dependency (`Depends(get_current_user_id)`) to get the authenticated user's internal `user_id` from the request state.

**6. Frontend Design (React)**

*   **Framework/Libraries:** React, Vite, shadcn-ui, Tailwind CSS, `@supabase/supabase-js`, `axios` (or `fetch`).
*   **Structure:** (Based on provided `tree.txt`)
    *   `src/App.tsx`: Router setup, global layout.
    *   `src/main.tsx`: App entry point.
    *   `src/components/`: UI components (including `auth/`, `chat/`, `dashboard/`, `ui/`).
    *   `src/context/AuthContext.tsx`: Manages Supabase auth state (`onAuthStateChange`), provides auth functions (`signIn`, `signUp`, `signOut`), user/session data.
    *   `src/hooks/`: Custom hooks.
    *   `src/layouts/DashboardLayout.tsx`: Authenticated routes layout with sidebar.
    *   `src/lib/`: Utilities.
    *   `src/pages/`: Page components (`Index.tsx`, `dashboard/Dashboard.tsx`, `dashboard/TasksPage.tsx`, etc.).
    *   `src/services/supabaseClient.ts`: Initialize Supabase JS client.
    *   `src/services/api.ts`: Axios instance configured with an interceptor to automatically add the Supabase JWT (`Authorization: Bearer <token>`) from the current session to outgoing requests to the FastAPI backend.
*   **Authentication Flow:**
    1.  User interacts with `SignInDialog` / `SignUpDialog`.
    2.  Components call functions from `AuthContext` (which use `supabase.auth.signIn...` / `signUp...`).
    3.  `AuthContext` listens to `onAuthStateChange` to update global state.
    4.  When authenticated, `api.ts` interceptor retrieves the access token from `supabase.auth.getSession()` and adds it to API request headers.
    5.  Protected routes/pages are rendered based on auth state in `AuthContext`.

**7. AI Orchestration Design (AutoGen)**

*   **Goal:** Enable AI to understand user requests related to wedding planning and execute actions across all application features.
*   **Agents (`ai/agents.py`):**
    *   `user_proxy` (UserProxyAgent): Represents the user, configured with `human_input_mode="NEVER"`.
    *   `planner` (AssistantAgent): Central coordinator. System prompt focuses on understanding user intent, breaking down tasks, delegating to specialized agents, and ensuring the final response is user-appropriate and formatted correctly (JSON).
    *   `TaskAgent` (AssistantAgent): Manages tasks. System prompt: "You are an expert in managing wedding tasks. Use the provided tools (`get_tasks`, `add_task`, `update_task`, `delete_task`) to interact with the user's task list." Registers task tools.
    *   `BudgetAgent` (AssistantAgent): Manages budget items. System prompt: "You manage wedding budget items. Use tools (`get_budget_items`, `add_budget_item`, `update_budget_item`, `delete_budget_item`) to interact with the user's budget." Registers budget tools.
    *   `GuestAgent` (AssistantAgent): Manages guest list. System prompt: "You manage the wedding guest list. Use tools (`get_guests`, `add_guest`, `update_guest`, `delete_guest`) to interact with the list." Registers guest tools.
    *   `TimelineAgent` (AssistantAgent): Manages timeline events. System prompt: "You manage the wedding timeline. Use tools (`get_timeline_events`, `add_timeline_event`, `update_timeline_event`, `delete_timeline_event`) to manage events." Registers timeline tools.
    *   `VendorAgent` (AssistantAgent): Manages user-tracked vendors and global vendor search. System prompt: "You manage the user's tracked vendor list and can search the main vendor directory. Use tools (`get_user_vendors`, `add_user_vendor`, `update_user_vendor`, `delete_user_vendor`, `search_global_vendors`) accordingly." Registers vendor tools.
    *   `MoodboardAgent` (AssistantAgent): Manages mood boards. System prompt: "You manage wedding mood boards. Use tools (`get_moodboards`, `get_moodboard_items`, `add_moodboard_item`, `delete_moodboard_item`) to interact with mood boards. Note: Image uploads must be done by the user via the UI." Registers mood board tools.
    *   `RitualAgent` (AssistantAgent): Provides ritual knowledge. System prompt: "You are knowledgeable about Hindu wedding rituals. Use the `query_ritual_knowledge_base` tool." Registers ritual tool.
*   **Tools (`ai/tools.py`):** Python functions wrapping backend repository/service calls. Each tool function *must* accept the authenticated `user_id` as an argument, along with other necessary parameters. See Section 9 for the detailed list.
*   **Group Chat (`ai/chat_manager.py`):**
    *   Initialize all agents.
    *   Register functions/tools with the appropriate agents.
    *   Create `autogen.GroupChat` with all agents.
    *   Create `autogen.GroupChatManager` to manage the conversation flow.
    *   The main chat handler function (`handle_message`) receives `user_id`, `session_id`, `message`, `chat_history`. It loads history, initiates the chat turn using `user_proxy.initiate_chat(manager, ...)`, captures the full transcript, persists messages (including tool calls/responses) to the database, and extracts/formats the final user-facing response. Agents must be prompted to format final output as specific JSON structures (e.g., `{ "type": "text", "text": "..." }`, `{ "type": "task_list", "data": [...] }`).

**8. API Reference (FastAPI Backend)**

*   **Authentication:** All endpoints require a valid Supabase JWT passed as `Authorization: Bearer <token>`, unless otherwise noted. The backend middleware verifies this token and associates the request with an internal `user_id`.
*   **Base URL:** `/api`

**User Profile (`/api/users`)**

*   `GET /me`:
    *   Auth: Required
    *   Response (200 OK): `schemas.User` (User profile details including wedding info)
*   `PUT /me`:
    *   Auth: Required
    *   Request Body: `schemas.UserUpdate` (Fields to update: `display_name`, `wedding_date`, `wedding_location`, `wedding_tradition`, `preferences`)
    *   Response (200 OK): `schemas.User` (Updated user profile)

**Tasks (`/api/tasks`)**

*   `GET /`:
    *   Auth: Required
    *   Response (200 OK): `List[schemas.Task]`
*   `POST /`:
    *   Auth: Required
    *   Request Body: `schemas.TaskCreate` (`description`, `due_date`?, `category`?)
    *   Response (201 Created): `schemas.Task` (Newly created task)
*   `GET /{task_id}`:
    *   Auth: Required
    *   Response (200 OK): `schemas.Task`
    *   Response (404 Not Found)
*   `PUT /{task_id}`:
    *   Auth: Required
    *   Request Body: `schemas.TaskUpdate` (`description`?, `is_complete`?, `due_date`?, `category`?)
    *   Response (200 OK): `schemas.Task` (Updated task)
    *   Response (404 Not Found)
*   `DELETE /{task_id}`:
    *   Auth: Required
    *   Response (204 No Content)
    *   Response (404 Not Found)

**Budget Items (`/api/budget`)**

*   `GET /items`:
    *   Auth: Required
    *   Response (200 OK): `List[schemas.BudgetItem]`
*   `POST /items`:
    *   Auth: Required
    *   Request Body: `schemas.BudgetItemCreate` (`item_name`, `category`, `amount`, `vendor_name`?, `status`?)
    *   Response (201 Created): `schemas.BudgetItem`
*   `GET /items/{item_id}`:
    *   Auth: Required
    *   Response (200 OK): `schemas.BudgetItem`
    *   Response (404 Not Found)
*   `PUT /items/{item_id}`:
    *   Auth: Required
    *   Request Body: `schemas.BudgetItemUpdate` (`item_name`?, `category`?, `amount`?, `vendor_name`?, `status`?)
    *   Response (200 OK): `schemas.BudgetItem` (Updated item)
    *   Response (404 Not Found)
*   `DELETE /items/{item_id}`:
    *   Auth: Required
    *   Response (204 No Content)
    *   Response (404 Not Found)
*   `GET /summary`:
    *   Auth: Required
    *   Response (200 OK): `schemas.BudgetSummary` (Total budget, spent, remaining, breakdown by category)

**Guest List (`/api/guests`)**

*   `GET /`:
    *   Auth: Required
    *   Response (200 OK): `List[schemas.Guest]`
*   `POST /`:
    *   Auth: Required
    *   Request Body: `schemas.GuestCreate` (`guest_name`, `contact_info`?, `relation`?, `side`?, `status`?, `dietary_requirements`?)
    *   Response (201 Created): `schemas.Guest`
*   `GET /{guest_id}`:
    *   Auth: Required
    *   Response (200 OK): `schemas.Guest`
    *   Response (404 Not Found)
*   `PUT /{guest_id}`:
    *   Auth: Required
    *   Request Body: `schemas.GuestUpdate` (Any field from `GuestCreate`?)
    *   Response (200 OK): `schemas.Guest` (Updated guest)
    *   Response (404 Not Found)
*   `DELETE /{guest_id}`:
    *   Auth: Required
    *   Response (204 No Content)
    *   Response (404 Not Found)
*   `GET /summary`:
    *   Auth: Required
    *   Response (200 OK): `schemas.GuestSummary` (Total count, confirmed, declined, pending counts)

**Timeline (`/api/timeline`)**

*   `GET /events`:
    *   Auth: Required
    *   Response (200 OK): `List[schemas.TimelineEvent]`
*   `POST /events`:
    *   Auth: Required
    *   Request Body: `schemas.TimelineEventCreate` (`event_name`, `event_date_time`, `location`?, `description`?)
    *   Response (201 Created): `schemas.TimelineEvent`
*   `GET /events/{event_id}`:
    *   Auth: Required
    *   Response (200 OK): `schemas.TimelineEvent`
    *   Response (404 Not Found)
*   `PUT /events/{event_id}`:
    *   Auth: Required
    *   Request Body: `schemas.TimelineEventUpdate` (Any field from `TimelineEventCreate`?)
    *   Response (200 OK): `schemas.TimelineEvent` (Updated event)
    *   Response (404 Not Found)
*   `DELETE /events/{event_id}`:
    *   Auth: Required
    *   Response (204 No Content)
    *   Response (404 Not Found)

**User Vendors (`/api/user-vendors`)**

*   `GET /`:
    *   Auth: Required
    *   Response (200 OK): `List[schemas.UserVendor]`
*   `POST /`:
    *   Auth: Required
    *   Request Body: `schemas.UserVendorCreate` (`vendor_name`, `vendor_category`, `contact_info`?, `status`?, `notes`?, `linked_vendor_id`?)
    *   Response (201 Created): `schemas.UserVendor`
*   `GET /{user_vendor_id}`:
    *   Auth: Required
    *   Response (200 OK): `schemas.UserVendor`
    *   Response (404 Not Found)
*   `PUT /{user_vendor_id}`:
    *   Auth: Required
    *   Request Body: `schemas.UserVendorUpdate` (Any field from `UserVendorCreate`?)
    *   Response (200 OK): `schemas.UserVendor` (Updated vendor)
    *   Response (404 Not Found)
*   `DELETE /{user_vendor_id}`:
    *   Auth: Required
    *   Response (204 No Content)
    *   Response (404 Not Found)

**Global Vendors (`/api/vendors`)** (Read-only for users, potentially admin-managed)

*   `GET /`:
    *   Auth: Required (or Public, TBD)
    *   Query Params: `category`?, `location_city`?, `name_query`?
    *   Response (200 OK): `List[schemas.Vendor]` (List of vendors from the global directory)
*   `GET /{vendor_id}`:
    *   Auth: Required (or Public, TBD)
    *   Response (200 OK): `schemas.Vendor`
    *   Response (404 Not Found)

**Mood Boards (`/api/moodboards`)**

*   `GET /`:
    *   Auth: Required
    *   Response (200 OK): `List[schemas.MoodBoard]` (Usually just one per user)
*   `POST /`: (If allowing multiple boards, currently assuming one)
    *   Auth: Required
    *   Request Body: `schemas.MoodBoardCreate` (`name`, `description`?)
    *   Response (201 Created): `schemas.MoodBoard`
*   `GET /{mood_board_id}`:
    *   Auth: Required
    *   Response (200 OK): `schemas.MoodBoard`
    *   Response (404 Not Found)
*   `PUT /{mood_board_id}`:
    *   Auth: Required
    *   Request Body: `schemas.MoodBoardUpdate` (`name`?, `description`?)
    *   Response (200 OK): `schemas.MoodBoard`
    *   Response (404 Not Found)
*   `GET /{mood_board_id}/items`:
    *   Auth: Required
    *   Response (200 OK): `List[schemas.MoodBoardItem]`
*   `POST /{mood_board_id}/items`:
    *   Auth: Required
    *   Request Body: `schemas.MoodBoardItemCreate` (`image_url`, `note`?, `category`?) - `image_url` obtained from frontend upload to Supabase Storage.
    *   Response (201 Created): `schemas.MoodBoardItem`
*   `DELETE /items/{item_id}`: (Note: Route path might differ, e.g., `/moodboards/items/{item_id}`)
    *   Auth: Required
    *   Response (204 No Content)
    *   Response (404 Not Found)
*   `POST /items/upload-url`: (Helper endpoint)
    *   Auth: Required
    *   Request Body: `schemas.UploadRequest` (`file_name`, `content_type`)
    *   Response (200 OK): `schemas.PresignedUploadResponse` (Contains presigned URL from Supabase Storage for direct frontend upload)

**Chat (`/api/chat`)**

*   `POST /`:
    *   Auth: Required
    *   Request Body: `schemas.ChatMessageCreate` (`message`: str, `session_id`: Optional[UUID])
    *   Response (200 OK): `schemas.ChatResponse` (`messages`: List[StructuredMessage], `session_id`: UUID) - `messages` contains the AI's response(s) formatted for the UI.
*   `GET /sessions`:
    *   Auth: Required
    *   Response (200 OK): `List[schemas.ChatSession]`
*   `GET /sessions/{session_id}/messages`:
    *   Auth: Required
    *   Response (200 OK): `List[schemas.ChatMessage]` (Full message history for a session)

**9. AutoGen Tool Definitions (`ai/tools.py`)**

These are Python functions registered with AutoGen agents. They wrap repository/service calls and *must* accept `user_id: UUID` passed by the chat manager.

*   **User Tools:**
    *   `get_user_profile(user_id: UUID) -> Dict`: Fetches user profile data. Returns `schemas.User`.
    *   `update_user_profile(user_id: UUID, updates: Dict) -> Dict`: Updates user profile. Expects `schemas.UserUpdate` fields in `updates`. Returns updated `schemas.User`.
*   **Task Tools:**
    *   `get_tasks(user_id: UUID, is_complete: Optional[bool] = None) -> List[Dict]`: Gets tasks, optionally filtered by completion status. Returns `List[schemas.Task]`.
    *   `add_task(user_id: UUID, description: str, due_date: Optional[str] = None, category: Optional[str] = None) -> Dict`: Adds a new task. Returns `schemas.Task`.
    *   `update_task(user_id: UUID, task_id: UUID, updates: Dict) -> Dict`: Updates a task. Expects `schemas.TaskUpdate` fields in `updates`. Returns updated `schemas.Task`.
    *   `delete_task(user_id: UUID, task_id: UUID) -> str`: Deletes a task. Returns confirmation message.
*   **Budget Tools:**
    *   `get_budget_items(user_id: UUID, category: Optional[str] = None) -> List[Dict]`: Gets budget items, optionally filtered. Returns `List[schemas.BudgetItem]`.
    *   `add_budget_item(user_id: UUID, item_name: str, category: str, amount: float, vendor_name: Optional[str] = None, status: Optional[str] = None) -> Dict`: Adds a budget item. Returns `schemas.BudgetItem`.
    *   `update_budget_item(user_id: UUID, item_id: UUID, updates: Dict) -> Dict`: Updates budget item. Expects `schemas.BudgetItemUpdate` fields. Returns `schemas.BudgetItem`.
    *   `delete_budget_item(user_id: UUID, item_id: UUID) -> str`: Deletes budget item. Returns confirmation.
    *   `get_budget_summary(user_id: UUID) -> Dict`: Gets budget summary. Returns `schemas.BudgetSummary`.
*   **Guest Tools:**
    *   `get_guests(user_id: UUID, status: Optional[str] = None) -> List[Dict]`: Gets guests, optionally filtered. Returns `List[schemas.Guest]`.
    *   `add_guest(user_id: UUID, guest_name: str, contact_info: Optional[str] = None, relation: Optional[str] = None, side: Optional[str] = None, status: Optional[str] = None, dietary_requirements: Optional[str] = None) -> Dict`: Adds a guest. Returns `schemas.Guest`.
    *   `update_guest(user_id: UUID, guest_id: UUID, updates: Dict) -> Dict`: Updates guest. Expects `schemas.GuestUpdate` fields. Returns `schemas.Guest`.
    *   `delete_guest(user_id: UUID, guest_id: UUID) -> str`: Deletes guest. Returns confirmation.
    *   `get_guest_summary(user_id: UUID) -> Dict`: Gets guest summary. Returns `schemas.GuestSummary`.
*   **Timeline Tools:**
    *   `get_timeline_events(user_id: UUID) -> List[Dict]`: Gets timeline events. Returns `List[schemas.TimelineEvent]`.
    *   `add_timeline_event(user_id: UUID, event_name: str, event_date_time: str, location: Optional[str] = None, description: Optional[str] = None) -> Dict`: Adds timeline event. Returns `schemas.TimelineEvent`.
    *   `update_timeline_event(user_id: UUID, event_id: UUID, updates: Dict) -> Dict`: Updates event. Expects `schemas.TimelineEventUpdate` fields. Returns `schemas.TimelineEvent`.
    *   `delete_timeline_event(user_id: UUID, event_id: UUID) -> str`: Deletes event. Returns confirmation.
*   **Vendor Tools:**
    *   `get_user_vendors(user_id: UUID, category: Optional[str] = None, status: Optional[str] = None) -> List[Dict]`: Gets user's tracked vendors. Returns `List[schemas.UserVendor]`.
    *   `add_user_vendor(user_id: UUID, vendor_name: str, vendor_category: str, contact_info: Optional[str] = None, status: Optional[str] = None, notes: Optional[str] = None, linked_vendor_id: Optional[UUID] = None) -> Dict`: Adds a vendor to user's list. Returns `schemas.UserVendor`.
    *   `update_user_vendor(user_id: UUID, user_vendor_id: UUID, updates: Dict) -> Dict`: Updates user vendor. Expects `schemas.UserVendorUpdate` fields. Returns `schemas.UserVendor`.
    *   `delete_user_vendor(user_id: UUID, user_vendor_id: UUID) -> str`: Deletes user vendor. Returns confirmation.
    *   `search_global_vendors(category: Optional[str] = None, location_city: Optional[str] = None, name_query: Optional[str] = None) -> List[Dict]`: Searches the global vendor directory. Returns `List[schemas.Vendor]`. (Note: `user_id` not needed for global search).
*   **Moodboard Tools:**
    *   `get_moodboards(user_id: UUID) -> List[Dict]`: Gets user's mood boards (likely one). Returns `List[schemas.MoodBoard]`.
    *   `get_moodboard_items(user_id: UUID, mood_board_id: UUID, category: Optional[str] = None) -> List[Dict]`: Gets items for a specific mood board. Returns `List[schemas.MoodBoardItem]`.
    *   `add_moodboard_item(user_id: UUID, mood_board_id: UUID, image_url: str, note: Optional[str] = None, category: Optional[str] = None) -> Dict`: Adds item (image URL from user upload). Returns `schemas.MoodBoardItem`.
    *   `delete_moodboard_item(user_id: UUID, item_id: UUID) -> str`: Deletes mood board item. Returns confirmation.
*   **Ritual Tools:**
    *   `query_ritual_knowledge_base(query: str) -> str`: Queries the knowledge base for ritual information (Implementation TBD - RAG, etc.). Returns text answer. (Note: `user_id` might be useful for context/personalization later).

**10. Security Considerations**

*   **Authentication:** Supabase JWT verification on *all* backend API routes handling user data.
*   **Authorization:** Backend logic must always use the authenticated `user_id` to scope database queries, ensuring users can only access their own data.
*   **Input Validation:** Use Pydantic schemas rigorously in FastAPI for request body validation. Sanitize inputs used in database queries (though ORM/Supabase client helps prevent SQL injection).
*   **Secrets Management:** Use environment variables (`.env` locally, secure secrets management in deployment) for Supabase keys, JWT secrets, LLM keys. Do *not* commit secrets to code.
*   **Supabase Security:** Use the `service_role` key *only* on the backend. Use the `anon` key on the frontend. Consider Supabase Row Level Security (RLS) as an additional defense layer if needed, though the API layer provides the primary authorization mechanism in this design. Ensure Storage buckets have appropriate access policies.
*   **Rate Limiting:** Implement rate limiting on the API gateway or within FastAPI to prevent abuse.
*   **Dependencies:** Keep backend and frontend dependencies updated to patch security vulnerabilities.

**11. Scalability & Deployment**

*   **Frontend:** Deploy as a static site using Vercel, Netlify, or similar services.
*   **Backend:** Deploy FastAPI application using Docker containers on services like Google Cloud Run, AWS ECS/Fargate, or Azure Container Apps for auto-scaling.
*   **Database:** Supabase PostgreSQL scales independently. Monitor usage and upgrade plan as needed. Optimize queries and ensure proper indexing.
*   **AI:** LLM API calls are external. AutoGen processing happens within the backend container; monitor resource usage (CPU/memory) under load.

**12. Next Steps / Future Enhancements**

*   Implement Ritual Knowledge Base (RAG pipeline).
*   Develop Vendor availability checks/booking integrations (potentially complex).
*   Add collaboration features (sharing with partner, planner).
*   Implement detailed reporting/analytics.
*   Refine AI agent interactions and response formatting.
*   Add real-time features (e.g., notifications) using Supabase Realtime or WebSockets.

This comprehensive document provides a detailed blueprint for building Sanskara AI using the specified technology stack, ensuring all features are accessible via both the UI and the AI assistant.