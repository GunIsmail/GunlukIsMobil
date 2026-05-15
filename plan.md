# Daily Job App - Project Master Plan

This document serves as the master blueprint for the application's architecture and implementation phases. Claude Code will follow this plan to build the project using **Clean Code**, **SOLID**, and **OOP** principles.

---

## 🏗 1. Tech Stack

*   **Backend:** .NET 10 Web API
    *   **Architecture:** Onion Architecture (Domain, Application, Infrastructure, WebAPI layers)
    *   **Principles:** Dependency Injection, Repository Pattern, Unit of Work, Result Pattern.
*   **Database:** PostgreSQL (EF Core)
*   **Mobile:** React Native (TypeScript) with Expo or CLI
*   **Security:** JWT (7-day lifespan) + Refresh Token + BCrypt Password Hashing
*   **Real-time:** SignalR (For instant messaging)

---

## 📝 2. Execution Phases

### Phase 1: Backend Core & Data Architecture
- [ ] Initialize Onion Architecture folder structure.
- [ ] **Domain Entities:** 
    - `User` (Worker/Employer roles), `JobAdvertisement`, `Application`, `ChatMessage`.
- [ ] **Enums:** `UserRole`, `ApplicationStatus`, `IstanbulDistricts`.
- [ ] **Persistence:** Configure EF Core with PostgreSQL, generate initial migrations.
- [ ] **Generic Repository:** Abstract base CRUD operations following SOLID.

### Phase 2: Identity & Security (Auth)
- [ ] **JWT Service:** Implementation of Token generation (7 days) and Refresh Token logic.
- [ ] **Verification:** 
    - `IEmailService` and `ISmsService` interfaces.
    - Terminal-based simulation classes (printing codes via `Console.WriteLine`).
- [ ] **Identity Controller:** Register, Login, and Token Refresh endpoints.
- [ ] **Middleware:** Global Exception Handler and JWT Authentication middleware.

### Phase 3: Job & Application Logic
- [ ] **Job Management:** 
    - Create Job (Validation: No past dates/times allowed).
    - Hardcoded list for Istanbul Districts (SelectBox data).
    - List Jobs (Public access - Anonymous).
    - Filtering: District, Date, Price Range.
- [ ] **Application Management:** 
    - Worker apply to job.
    - Employer list applications, Accept/Reject actions.

### Phase 4: SignalR Real-time Chat
- [ ] **ChatHub:** Setup SignalR connection hub.
- [ ] **Logic Gate:** Restrict messaging permission to users where `ApplicationStatus == Accepted`.
- [ ] **Message History:** Fetch past messages from the database.

### Phase 5: Mobile App (React Native)
- [ ] **Base Setup:** Navigation (Stack/Tab), Axios Instance, State Management (Zustand).
- [ ] **Auth UI:** Login, Register, and Terminal OTP verification screens.
- [ ] **Worker Flow:** Job Feed (Guest access), Filtering, My Applications, Profile.
- [ ] **Employer Flow:** My Jobs, Create Job (Toggles for Food, District Select), Applicant Management.
- [ ] **Chat UI:** Real-time messaging screen with SignalR integration.
- [ ] **Mitigate All Dependencies:** While you can use config info like colors, fonts; seperate Functionals process to another folder like api calls, etc...  
(DO IT BEST PRACTICE IF WE WRONG THAT INSTRUCTION But tell us why you think that will be better)
!!! Base url should be in ENV !!!
- [ ] **Add Notification System:** 
    - Push Notifications for new job applications and messages.
    - In-app notification center.
- [ ] **Theme:** Userfriendly UI With fluent animations, dark theme support, and smooth responsive for all screen sizes.

---

## 🛠 3. Strict Rules of Engagement

1.  **Full Autonomy:** Claude Code has full authority for all file operations and command executions; no need to ask for confirmation (Auto-approve mode).
2.  **SOLID & Clean Code:** 
    - Each class must have a Single Responsibility (SRP).
    - Depend on abstractions, not concretions (DIP).
    - Methods must be concise, descriptive, and follow DRY principles.
3.  **Validation:** 
    - Backend: Use `FluentValidation` for all DTOs.
    - Frontend: Strict input validation before submission.
4.  **JWT Handling:** 
    - Store tokens securely on mobile (SecureStore).
    - Automatic token attachment to headers via interceptors.
