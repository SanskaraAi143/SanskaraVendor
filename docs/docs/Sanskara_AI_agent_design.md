# Sanskara AI: Multi-Agent Architecture Design (Google ADK Adaptation)

## 1. Introduction

This document outlines the multi-agent architecture for Sanskara AI, adapted to align with concepts from the Google Agent Development Kit (ADK). The system is designed around a single orchestrating "System Agent" that delegates tasks to specialized agents, organized into functional groups. Agents interact with the backend via defined tools, which correspond to secure API endpoints.

## 2. ADK Core Concepts Applied

*   **Agent:** A modular component responsible for specific tasks, with a defined role, prompt, and set of callable tools or interactions with other agents.
*   **Tool:** A function or capability exposed to an agent, typically interacting with external systems or data (in this case, the backend API endpoints).
*   **Orchestration:** The process by which a primary agent manages the workflow, delegates tasks to other agents, and synthesizes results. In this design, the System Agent handles high-level orchestration, and manager agents handle orchestration within their specific groups.

## 3. Agent Design

Agents in Sanskara AI are defined with specific roles and prompts to guide their behavior within the ADK framework.

### 3.1. System Agent

*   **Role:** The primary entry point and orchestrator of the Sanskara AI multi-agent system. It understands user intent, manages the overall workflow, delegates to specialized and manager agents, and synthesizes the final response.
*   **System Prompt (Example):** "You are the central intelligence and orchestrator of the Sanskara AI wedding planning system, built on the Google ADK. Your role is to receive user input, understand their intent, and manage the conversation flow by delegating tasks to specialized and group manager agents. Analyze complex requests, determine which agents are needed, initiate conversations or tool calls through those agents, collect their responses, and synthesize a coherent, accurate, and user-friendly final response. Always ensure the output is well-formatted and directly addresses the user's request. You delegate tasks but do not directly use tools yourself."
*   **Input:** Natural language user messages.
*   **Output:**
    *   Intent understanding and context extraction.
    *   Delegation instructions for specialized agents and group managers.
    *   Synthesized information from sub-agents.
    *   Final, formatted responses for the user.
*   **ADK Interaction:** Receives initial user input. Interacts with other agents via delegation/messaging mechanisms provided by the ADK.

### 3.2. Planning Data Agent

*   **Role:** Manages all core planning data (tasks, budget, guest list, timeline) for the user.
*   **System Prompt (Example):** "You are the Planning Data Agent, an expert in managing the user's wedding planning data (tasks, budget, guest list, timeline). You are called by the System Agent to perform operations on this data using the tools provided to you. Your responsibilities include accurately creating, reading, updating, and deleting planning items based on requests. Provide clear and detailed responses, including lists of items when retrieving data. Ensure all operations are scoped to the specific user."
*   **Input:** Requests from the System Agent related to managing tasks, budget, guests, or timeline.
*   **Output:**
    *   Results from data operations (e.g., list of tasks, confirmation of item creation).
    *   Error messages if an operation fails.
*   **ADK Interaction:** Receives requests from the System Agent. Calls registered tools (`get_tasks`, `add_task`, etc.) to interact with the backend API.

### 3.3. Personalization & Learning Agent

*   **Role:** Learns user preferences, provides recommendations, and tailors the wedding planning experience. Includes a recommendation system capability.
*   **System Prompt (Example):** "You are the Personalization and Learning Agent. Your role is to understand the user's preferences, style, budget, and past interactions to provide tailored recommendations for vendors, themes, rituals, etc. You are called by the System Agent when personalization or recommendations are needed. You have access to user profile data and a recommendation system tool. Continuously learn from user feedback and choices to improve future recommendations. Provide recommendations that are relevant, specific, and actionable for the user."
*   **Input:** Requests from the System Agent for personalization or recommendations, including user context or specific needs.
*   **Output:**
    *   Tailored recommendations.
    *   Personalized suggestions or insights.
    *   Confirmation of user profile updates.
*   **ADK Interaction:** Receives requests from the System Agent. Calls registered tools (`get_user_profile`, `update_user_profile`, `get_recommendations`) to get user data and generate recommendations.

### 3.4. Curated Knowledge Agent

*   **Role:** Provides information about Hindu wedding rituals, traditions, and cultural practices.
*   **System Prompt (Example):** "You are the Curated Knowledge Agent, an expert on Hindu wedding rituals and traditions. You are called by the System Agent when the user asks questions about rituals, customs, or their significance. Your primary tool is the ritual knowledge base. Provide accurate, detailed, and culturally sensitive information. Ensure your answers are directly relevant to the user's query and easy to understand."
*   **Input:** Questions or requests from the System Agent related to Hindu wedding rituals or traditions.
*   **Output:**
    *   Detailed explanations of rituals, customs, etc.
    *   Answers to specific cultural questions.
*   **ADK Interaction:** Receives requests from the System Agent. Calls the registered tool (`query_ritual_knowledge_base`) to retrieve information from the knowledge base.

### 3.5. Advanced Ops Manager

*   **Role:** Manages and delegates tasks within the Advanced Operations and Analysis group (Web search, Reporting, Code Execution).
*   **System Prompt (Example):** "You are the Advanced Ops Manager. You coordinate the Web Agent, Reporting & Analytics Agent, and Code Executor Agent. You are called by the System Agent when a task requires external data, data analysis, or computation. Your role is to understand the System Agent's request, determine which agent(s) within your group are needed, delegate the task, oversee their execution, and consolidate their results before returning them to the System Agent. You do not use tools directly; you orchestrate your sub-agents. Ensure the final result from your group is accurate and complete."
*   **Input:** Requests from the System Agent for advanced operations (web search, reporting, code execution).
*   **Output:**
    *   Delegation instructions for Web Agent, Reporting & Analytics Agent, or Code Executor Agent.
    *   Consolidated results from sub-agents.
*   **ADK Interaction:** Receives requests from the System Agent. Interacts with Web Agent, Reporting & Analytics Agent, and Code Executor Agent via ADK messaging/delegation.

#### 3.5.1. Web Agent

*   **Role:** Interacts with external web resources to gather information.
*   **System Prompt (Example):** "You are the Web Agent, a specialist in retrieving information from the internet. You are called by the Advanced Ops Manager when a task requires searching the web for vendors, venues, inspiration, or other wedding-related information. Use your web search tool efficiently and provide relevant links and summaries. Cite your sources. Be precise and retrieve up-to-date information."
*   **Input:** Search queries or requests for specific web information from the Advanced Ops Manager.
*   **Output:**
    *   Search results (links, text snippets).
    *   Extracted information from web pages.
*   **ADK Interaction:** Receives requests from the Advanced Ops Manager. Calls the registered tool (`web_search`).

#### 3.5.2. Reporting & Analytics Agent

*   **Role:** Generates reports and analyzes planning data.
*   **System Prompt (Example):** "You are the Reporting & Analytics Agent. You are called by the Advanced Ops Manager when the user needs a report or analysis of their planning data (budget, guest list, tasks, etc.). You have access to a data aggregation tool to retrieve the necessary data. Generate clear, accurate, and insightful reports. Summarize key findings when appropriate. Ensure reports are based on the user's specific data."
*   **Input:** Requests from the Advanced Ops Manager for specific reports or data analysis.
*   **Output:**
    *   Structured reports (e.g., budget breakdown, guest RSVP summary).
    *   Analysis and insights based on the data.
*   **ADK Interaction:** Receives requests from the Advanced Ops Manager. Calls the registered tool (`get_data_aggregation`).

#### 3.5.3. Code Executor Agent (Sandboxed)

*   **Role:** Executes code securely in a sandboxed environment for calculations or data processing.
*   **System Prompt (Example):** "You are the Code Executor Agent. You are called by the Advanced Ops Manager when a task requires executing code for calculations, data manipulation, or other computational tasks. You operate in a secure, sandboxed environment. Execute the provided code and return the output. Do not access external resources or user data beyond what is provided for execution. Only execute trusted code."
*   **Input:** Code snippets and potentially data inputs for execution from the Advanced Ops Manager.
*   **Output:**
    *   Results from code execution.
    *   Error messages if code execution fails.
*   **ADK Interaction:** Receives requests from the Advanced Ops Manager. Calls the registered tool (`execute_code`).

### 3.6. Creative/Content Manager

*   **Role:** Manages and delegates tasks within the Creative and Content group (Image Generation, Collaboration, Vendor Contact).
*   **System Prompt (Example):** "You are the Creative/Content Manager. You coordinate the Image Gen Agent, Collaboration Agent, and Vendor Contact Agent. You are called by the System Agent when a task involves creating visual content, facilitating collaboration, or communicating with vendors. Your role is to understand the System Agent's request, determine which agent(s) within your group are needed, delegate the task, oversee their execution, and consolidate their results before returning them to the System Agent. You do not use tools directly; you orchestrate your sub-agents. Ensure the final creative assets or communications are high-quality and aligned with the user's vision."
*   **Input:** Requests from the System Agent for creative assets, collaboration, or vendor communication.
*   **Output:**
    *   Delegation instructions for Image Gen Agent, Collaboration Agent, or Vendor Contact Agent.
    *   Consolidated results and creative assets from sub-agents.
*   **ADK Interaction:** Receives requests from the System Agent. Interacts with Image Gen Agent, Collaboration Agent, and Vendor Contact Agent via ADK messaging/delegation.

#### 3.6.1. Image Gen Agent

*   **Role:** Generates images and manages mood board items.
*   **System Prompt (Example):** "You are the Image Gen Agent, a specialist in creating visual content. You are called by the Creative Content Manager when the user needs images generated or wants to add images to their mood board. Use your image generation tool to create visuals based on descriptions and your mood board tool to add items. Ensure generated images match the user's request and mood board theme."
*   **Input:** Requests from the Creative Content Manager for image generation (with descriptions) or adding mood board items (with image URLs).
*   **Output:**
    *   URLs of generated images.
    *   Confirmation of mood board item additions.
*   **ADK Interaction:** Receives requests from the Creative Content Manager. Calls registered tools (`create_image_from_text`, `add_moodboard_item`).

#### 3.6.2. Collaboration Agent

*   **Role:** Manages user collaboration on the wedding project.
*   **System Prompt (Example):** "You are the Collaboration Agent. You are called by the Creative Content Manager when the user wants to invite collaborators to their wedding planning project. Use your collaboration tools to add users. Ensure user permissions are handled correctly and confirm successful additions."
*   **Input:** Requests from the Creative Content Manager to add collaborators, including user details (e.g., email).
*   **Output:**
    *   Confirmation of collaborator invitations/additions.
    *   Information about existing collaborators.
*   **ADK Interaction:** Receives requests from the Creative Content Manager. Calls the registered tool (`add_user_to_project`).

#### 3.6.3. Vendor Contact Agent

*   **Role:** Manages interaction and communication with vendors.
*   **System Prompt (Example):** "You are the Vendor Contact Agent, a specialist in vendor management and communication. You are called by the Creative Content Manager when the user wants to find global vendors, manage their tracked vendors, or send emails to vendors. Use your vendor management and email tools to perform these actions. Provide accurate vendor information and confirm communication actions."
*   **Input:** Requests from the Creative Content Manager related to finding vendors, managing user vendors, or sending emails to vendors.
*   **Output:**
    *   Lists of global or user vendors.
    *   Confirmation of vendor additions/updates/deletions.
    *   Confirmation of emails sent.
*   **ADK Interaction:** Receives requests from the Creative Content Manager. Calls registered tools (`get_user_vendors`, `add_user_vendor`, `update_user_vendor`, `delete_user_vendor`, `search_global_vendors`, `send_email`).

## 4. Tool Design (ADK Adaptation)

Tools are the capabilities agents use to interact with the backend API. In ADK, tools are typically defined functions that agents can call, with clear input and output schemas.

*   **Tool Definition:** Each tool corresponds to a backend API endpoint. The ADK framework will need to be configured to map agent tool calls to the appropriate backend service endpoints.
*   **Input/Output:** Defined using schemas (e.g., Pydantic models) to ensure structured data exchange.
*   **User Context:** All tools interacting with user-specific data implicitly require the authenticated user's ID, which the backend middleware ensures. ADK might handle passing user context to tools.

Here's a summary of the tools, their function, input, and output:

| Tool Name                      | Description                                                                 | Input                                                                                                   | Output                                      | Used By Agent(s)                                                                |
| :----------------------------- | :-------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------ | :------------------------------------------ | :------------------------------------------------------------------------------ |
| `get_user_profile`             | Retrieves the current user's profile information.                           | `user_id`: UUID                                                                                         | `schemas.User`                              | Personalization & Learning Agent                                                |
| `update_user_profile`          | Updates the current user's profile with specified fields.                   | `user_id`: UUID, `updates`: dict (from `schemas.UserUpdate`)                                            | Updated `schemas.User`                      | Personalization & Learning Agent                                                |
| `get_tasks`                    | Gets a user's tasks, optionally filtered by completion status.              | `user_id`: UUID, `is_complete`: bool (optional)                                                         | `List[schemas.Task]`                        | Planning Data Agent                                                             |
| `add_task`                     | Adds a new task for the user.                                               | `user_id`: UUID, `description`: str, `due_date`: str (optional), `category`: str (optional)             | `schemas.Task`                              | Planning Data Agent                                                             |
| `update_task`                  | Updates an existing task for the user.                                      | `user_id`: UUID, `task_id`: UUID, `updates`: dict (from `schemas.TaskUpdate`)                           | Updated `schemas.Task`                      | Planning Data Agent                                                             |
| `delete_task`                  | Deletes a task for the user.                                                | `user_id`: UUID, `task_id`: UUID                                                                        | Confirmation message (str)                  | Planning Data Agent                                                             |
| `get_budget_items`             | Gets a user's budget items, optionally filtered by category.              | `user_id`: UUID, `category`: str (optional)                                                             | `List[schemas.BudgetItem]`                  | Planning Data Agent                                                             |
| `add_budget_item`              | Adds a new budget item for the user.                                        | `user_id`: UUID, `item_name`: str, `category`: str, `amount`: float, `vendor_name`: str, `status`: str | `schemas.BudgetItem`                        | Planning Data Agent                                                             |
| `update_budget_item`           | Updates an existing budget item for the user.                               | `user_id`: UUID, `item_id`: UUID, `updates`: dict (from `schemas.BudgetItemUpdate`)                     | Updated `schemas.BudgetItem`                | Planning Data Agent                                                             |
| `delete_budget_item`           | Deletes a budget item for the user.                                         | `user_id`: UUID, `item_id`: UUID                                                                        | Confirmation message (str)                  | Planning Data Agent                                                             |
| `get_budget_summary`           | Gets a summary of the user's budget.                                        | `user_id`: UUID                                                                                         | `schemas.BudgetSummary`                     | Planning Data Agent                                                             |
| `get_guests`                   | Gets a user's guest list, optionally filtered by status.                  | `user_id`: UUID, `status`: str (optional)                                                               | `List[schemas.Guest]`                       | Planning Data Agent                                                             |
| `add_guest`                    | Adds a new guest to the user's list.                                        | `user_id`: UUID, `guest_name`: str, ...other optional fields                                            | `schemas.Guest`                             | Planning Data Agent                                                             |
| `update_guest`                 | Updates an existing guest's information.                                    | `user_id`: UUID, `guest_id`: UUID, `updates`: dict (from `schemas.GuestUpdate`)                         | Updated `schemas.Guest`                     | Planning Data Agent                                                             |
| `delete_guest`                 | Deletes a guest from the user's list.                                       | `user_id`: UUID, `guest_id`: UUID                                                                       | Confirmation message (str)                  | Planning Data Agent                                                             |
| `get_guest_summary`            | Gets a summary of the user's guest list.                                    | `user_id`: UUID                                                                                         | `schemas.GuestSummary`                      | Planning Data Agent                                                             |
| `get_timeline_events`          | Gets a user's timeline events.                                              | `user_id`: UUID                                                                                         | `List[schemas.TimelineEvent]`               | Planning Data Agent                                                             |
| `add_timeline_event`           | Adds a new timeline event for the user.                                     | `user_id`: UUID, `event_name`: str, `event_date_time`: str, ...other optional fields                  | `schemas.TimelineEvent`                     | Planning Data Agent                                                             |
| `update_timeline_event`        | Updates an existing timeline event for the user.                            | `user_id`: UUID, `event_id`: UUID, `updates`: dict (from `schemas.TimelineEventUpdate`)               | Updated `schemas.TimelineEvent`             | Planning Data Agent                                                             |
| `delete_timeline_event`        | Deletes a timeline event for the user.                                      | `user_id`: UUID, `event_id`: UUID                                                                       | Confirmation message (str)                  | Planning Data Agent                                                             |
| `get_user_vendors`             | Gets a user's tracked vendors, optionally filtered.                       | `user_id`: UUID, `category`: str (optional), `status`: str (optional)                                   | `List[schemas.UserVendor]`                  | Vendor Contact Agent                                                            |
| `add_user_vendor`              | Adds a vendor to the user's tracked list.                                   | `user_id`: UUID, `vendor_name`: str, `vendor_category`: str, ...other optional fields                 | `schemas.UserVendor`                        | Vendor Contact Agent                                                            |
| `update_user_vendor`           | Updates an existing user-tracked vendor.                                    | `user_id`: UUID, `user_vendor_id`: UUID, `updates`: dict (from `schemas.UserVendorUpdate`)              | Updated `schemas.UserVendor`                | Vendor Contact Agent                                                            |
| `delete_user_vendor`           | Deletes a user-tracked vendor.                                              | `user_id`: UUID, `user_vendor_id`: UUID                                                                 | Confirmation message (str)                  | Vendor Contact Agent                                                            |
| `search_global_vendors`        | Searches the global vendor directory.                                       | `category`: str (optional), `location_city`: str (optional), `name_query`: str (optional)             | `List[schemas.Vendor]`                      | Vendor Contact Agent                                                            |
| `get_moodboards`               | Gets a user's mood boards.                                                  | `user_id`: UUID                                                                                         | `List[schemas.MoodBoard]`                   | Image Gen Agent                                                                 |
| `get_moodboard_items`          | Gets items for a specific mood board.                                       | `user_id`: UUID, `mood_board_id`: UUID, `category`: str (optional)                                      | `List[schemas.MoodBoardItem]`               | Image Gen Agent                                                                 |
| `add_moodboard_item`           | Adds an item (image URL) to a mood board.                                   | `user_id`: UUID, `mood_board_id`: UUID, `image_url`: str, `note`: str, `category`: str                  | `schemas.MoodBoardItem`                     | Image Gen Agent                                                                 |
| `delete_moodboard_item`        | Deletes an item from a mood board.                                          | `user_id`: UUID, `item_id`: UUID                                                                        | Confirmation message (str)                  | Image Gen Agent                                                                 |
| `create_image_from_text`       | Generates an image from a text description.                                 | `text`: str, `style`: str                                                                               | `image_url`: str                            | Image Gen Agent                                                                 |
| `add_user_to_project`          | Adds a user as a collaborator to the project.                               | `user_id`: UUID (of the owner), `email`: str (of the collaborator)                                      | Confirmation message (str)                  | Collaboration Agent                                                             |
| `web_search`                   | Performs a web search for wedding-related information.                      | `query`: str                                                                                            | `List[dict]` (search results)               | Web Agent                                                                       |
| `send_email`                   | Sends an email.                                                             | `email`: str, `subject`: str, `body`: str                                                               | Confirmation message (str)                  | Vendor Contact Agent                                                            |
| `get_data_aggregation`         | Retrieves aggregated data for reporting and analysis (e.g., budget totals). | (Parameters depend on aggregation needed, likely includes `user_id` and criteria)                     | `List[dict]` (aggregated data)              | Reporting & Analytics Agent                                                     |
| `execute_code`                 | Executes code in a sandboxed environment.                                   | `code`: str, `data`: dict (optional input data)                                                         | Execution results (str or dict)             | Code Executor Agent                                                             |
| `query_ritual_knowledge_base`  | Queries the curated knowledge base for Hindu ritual information (RAG).      | `query`: str                                                                                            | Text explanation (str)                      | Curated Knowledge Agent                                                         |
| `get_recommendations`          | Gets personalized recommendations based on user data and query.               | `user_id`: UUID, `query`: str (user's current need/context)                                            | `List[schemas.Recommendation]` (or similar) | Personalization & Learning Agent                                                |

## 5. Agent Communication and Workflow (ADK Adaptation)

The workflow is managed through delegation, starting from the System Agent.

1.  **User Input:** The System Agent receives the initial user message.
2.  **Intent & Delegation:** The System Agent analyzes the message to understand intent and context. Based on this, it determines which specialized agent or group manager is needed.
3.  **Task Delegation:** The System Agent delegates the task to the appropriate agent/manager. This could involve sending a message with instructions and context.
4.  **Sub-Delegation (for Groups):** If a group manager receives the task (`AdvancedOpsManager`, `CreativeContentManager`), it further delegates to one or more agents within its group based on the specific requirement (e.g., web search, image generation).
5.  **Tool Execution:** The specialized agents (Planning Data, Personalization, Knowledge, Web, Reporting, Code Executor, Image Gen, Collaboration, Vendor Contact) receive their tasks and call the necessary tools (backend API endpoints) to perform the required action or retrieve data.
6.  **Result Aggregation:**
    *   For agents within groups, results are returned to their respective manager. The manager might aggregate or process results from multiple sub-agents.
    *   Results from specialized agents and group managers are returned to the System Agent.
7.  **Response Synthesis:** The System Agent collects all relevant information and synthesizes it into a single, coherent response for the user.
8.  **User Output:** The System Agent provides the final formatted response.

The ADK framework's messaging and agent interaction capabilities will facilitate this delegation and result passing between agents.

## 6. Mermaid Diagram (ADK Adapted with Tool Usage)

```mermaid
graph TD
    subgraph "Sanskara AI System (Google ADK)"
        SystemAgent[System Agent - Orchestrator]
        subgraph "Specialized Agents"
            PersonalizationAgent[Personalization & Learning Agent]
            PlanningDataAgent[Planning Data Agent]
            CuratedKnowledgeAgent[Curated Knowledge Agent]
        end
        subgraph "Advanced Ops Group"
            AdvancedOpsManager[Advanced Ops Manager - Group Orchestrator]
            WebAgent[Web Agent]
            ReportingAgent[Reporting & Analytics Agent]
            CodeExecutorAgent[Code Executor Agent]
        end
        subgraph "Creative & Content Group"
            CreativeContentManager[Creative/Content Manager - Group Orchestrator]
            ImageGenAgent[Image Gen Agent]
            CollaborationAgent[Collaboration Agent]
            VendorContactAgent[Vendor Contact Agent]
        end
    end
    subgraph "Backend Services"
        BackendAPI[Backend API Endpoints - Implemented as Tools]
        Database[Supabase Database]
    end

    SystemAgent -- "Delegates Tasks" --> PersonalizationAgent
    SystemAgent -- "Delegates Tasks" --> PlanningDataAgent
    SystemAgent -- "Delegates Tasks" --> CuratedKnowledgeAgent
    SystemAgent -- "Delegates to Group" --> AdvancedOpsManager
    SystemAgent -- "Delegates to Group" --> CreativeContentManager

    AdvancedOpsManager -- "Delegates Task" --> WebAgent
    AdvancedOpsManager -- "Delegates Task" --> ReportingAgent
    AdvancedOpsManager -- "Delegates Task" --> CodeExecutorAgent

    CreativeContentManager -- "Delegates Task" --> ImageGenAgent
    CreativeContentManager -- "Delegates Task" --> CollaborationAgent
    CreativeContentManager -- "Delegates Task" --> VendorContactAgent

    PersonalizationAgent -- "Uses Tools: get_user_profile, update_user_profile, get_recommendations" --> BackendAPI
    PlanningDataAgent -- "Uses Tools: get_tasks, add_task, update_task, delete_task, get_budget_items, add_budget_item, update_budget_item, delete_budget_item, get_budget_summary, get_guests, add_guest, update_guest, delete_guest, get_guest_summary, get_timeline_events, add_timeline_event, update_timeline_event, delete_timeline_event" --> BackendAPI
    CuratedKnowledgeAgent -- "Uses Tool: query_ritual_knowledge_base" --> BackendAPI
    WebAgent -- "Uses Tool: web_search" --> BackendAPI
    ReportingAgent -- "Uses Tool: get_data_aggregation" --> BackendAPI
    CodeExecutorAgent -- "Uses Tool: execute_code" --> BackendAPI
    ImageGenAgent -- "Uses Tools: create_image_from_text, add_moodboard_item" --> BackendAPI
    CollaborationAgent -- "Uses Tool: add_user_to_project" --> BackendAPI
    VendorContactAgent -- "Uses Tools: get_user_vendors, add_user_vendor, update_user_vendor, delete_user_vendor, search_global_vendors, send_email" --> BackendAPI

    BackendAPI -- "Interacts With" --> Database

    style SystemAgent fill:#f9f,stroke:#333,stroke-width:2px
    style AdvancedOpsManager fill:#ccf,stroke:#333,stroke-width:1px
    style CreativeContentManager fill:#ccf,stroke:#333,stroke-width:1px
    style BackendAPI fill:#cfc,stroke:#333,stroke-width:1px
    style Database fill:#cfc,stroke:#333,stroke-width:1px
