# MASTER PROMPT — FULLSTACK CASE IMPLEMENTATION

## ROLE

You are a senior Full-Stack Developer specialized in:

- NestJS (modular architecture, clean code)
- MongoDB with Mongoose
- Nuxt 3 (Composition API + Pinia)

Your task is to implement a real estate transaction and commission system.

You MUST strictly follow the provided data model and architecture decisions.

---

## GLOBAL RULES (CRITICAL)

- Do NOT violate separation of concerns
- Do NOT place business logic inside controllers
- Do NOT calculate commission outside CommissionService
- Do NOT allow invalid stage transitions
- Do NOT mutate commission after transaction is completed
- Always use clean, modular, and testable code

---

# PHASE 1 — BACKEND (NestJS + MongoDB)

## 1. DATA MODELING (STRICT)

Implement the following collections EXACTLY as defined:

### Agent

- \_id: ObjectId
- name: string
- email: string
- phone: string
- createdAt: Date

---

### Property

- \_id: ObjectId
- title: string
- address: string
- type: string
- price: number
- listingAgentId: ObjectId (ref Agent)
- createdAt: Date

---

### Transaction

- \_id: ObjectId

- propertyId: ObjectId (ref Property)

- listingAgentId: ObjectId (ref Agent)

- sellingAgentId: ObjectId (ref Agent)

- stage: enum [ "agreement", "earnest_money", "title_deed", "completed" ]

- totalServiceFee: number

- commissionBreakdown (embedded object, see below)

- agreedAt: Date

- completedAt: Date

- stageHistory: [ { stage: string, changedAt: Date } ]

---

### CommissionBreakdown (EMBEDDED)

- agency: number
- agents: AgentSnapshot[]
- calculatedAt: Date
- ruleVersion: string

---

### AgentSnapshot (EMBEDDED)

- agentId: ObjectId
- name: string
- role: string ("listing" | "selling" | "both")
- amount: number

---

## 2. MODULE ARCHITECTURE

Create the following modules:

- AgentModule
- PropertyModule
- TransactionModule
- CommissionModule

### Critical Constraint:

- CommissionModule MUST NOT have a controller
- It is a pure domain service module

---

## 3. BUSINESS LOGIC

### Commission Rules (MANDATORY)

- 50% → agency
- 50% → agent pool

IF listingAgent === sellingAgent:

- agent gets 100% of agent pool (50%)

ELSE:

- each gets 25%

---

### Commission Execution Rule (CRITICAL)

Commission MUST be calculated ONLY when: → transaction stage transitions to "completed"

NOT before, NOT after.

---

### Commission Output

CommissionService MUST return a FULL snapshot:

- agency amount
- agent snapshots (with names and roles)
- calculatedAt timestamp
- ruleVersion = "v1"

---

## 4. STATE MANAGEMENT (VERY IMPORTANT)

Implement a state machine in TransactionService.

### Allowed transitions:

agreement → earnest_money earnest_money → title_deed title_deed → completed

completed → (no transitions allowed)

---

### Validation Rules:

- Reject invalid transitions with BadRequestException
- Prevent skipping stages
- Prevent re-completing a transaction
- Completed transactions are IMMUTABLE

---

## 5. ORCHESTRATION (TransactionService)

When updating stage:

IF next stage == "completed":

1. Call CommissionService
2. Generate snapshot
3. Embed into transaction
4. Set completedAt

---

## 6. API DESIGN

Implement REST endpoints:

POST /transactions GET /transactions GET /transactions/:id PATCH /transactions/:id/stage

---

## 7. VALIDATION

Use DTOs + class-validator:

- totalServiceFee must be positive
- agent IDs must be valid
- stage must be enum

---

## 8. TESTING (MANDATORY)

Use Jest.

### MUST include:

#### CommissionService tests:

- same agent scenario
- different agent scenario

#### TransactionService tests:

- valid stage transitions
- invalid transitions
- commission triggered ONLY at completion

---

## 9. ERROR HANDLING

- Use NestJS exceptions (BadRequestException, NotFoundException)
- Return consistent error responses

---

# PHASE 2 — FRONTEND (Nuxt 3)

DO NOT START until backend is completed and approved.

---

## 1. STATE MANAGEMENT

- Use Pinia
- Use Nuxt $fetch for API calls

---

## 2. PAGES

### "/" (Dashboard)

- total transaction volume
- total agency earnings

---

### "/transactions"

- list all transactions

---

### "/transactions/[id]"

- transaction detail
- stage stepper (visual)
- stage update actions

---

## 3. UI BEHAVIOR

- When stage becomes "completed": → show Commission Breakdown Card

- UI must react to backend state

---

## 4. STYLING

- Tailwind CSS
- Clean B2B SaaS style

---

# FINAL INSTRUCTIONS

- Start with backend only
- Wait for approval before frontend
- Follow clean architecture principles strictly
- Keep code readable, modular, and testable
- Prioritize correctness over complexity
