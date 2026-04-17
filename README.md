# Iceberg Case App

A full-stack real estate transaction system that models lifecycle progression as a **state machine** and ensures financial correctness by computing commissions as an **immutable snapshot at completion**.

---

## 🚀 Overview

This project focuses on solving a core domain problem:

> How to safely manage a transaction lifecycle and guarantee consistent financial outcomes.

Key principles:

- Transactions are **stateful workflows**, not simple CRUD records
- Commission is **calculated once** at the moment of completion
- Financial results are stored as **immutable snapshots**
- Backend acts as the **single source of truth** for all business rules

---

## 🧱 Tech Stack

**Backend**

- NestJS
- MongoDB + Mongoose
- class-validator
- Jest

**Frontend**

- Nuxt 3
- Pinia
- Tailwind CSS

---

## ⚙️ Core Concepts

### 1. Transaction as a State Machine

```text
agreement → earnest_money → title_deed → completed
```

- Forward-only transitions
- No skipping or reverting
- `completed` is terminal

This ensures that the system always remains in a **valid business state**.

---

### 2. Commission Calculation (Snapshot Pattern)

Commission is calculated **only once** during:

```text
title_deed → completed
```

At that moment:

- 50% → agency
- 50% → agent pool

Rules:

- Same agent → gets full agent pool
- Different agents → split equally

The result is stored as:

```text
commissionBreakdown (embedded snapshot)
```

Why this matters:

- Prevents recalculation inconsistencies
- Preserves historical accuracy
- Decouples financial data from future rule changes

---

### 3. Immutability of Completed Transactions

Once a transaction reaches `completed`:

- Stage updates are rejected
- Commission is locked
- Financial outcome is treated as final

This ensures **financial integrity** and prevents accidental mutation.

---

### 4. Domain-Driven Service Design

`CommissionService` is:

- Controller-less
- Pure (no DB access)
- Deterministic

It is invoked **only by `TransactionService`**, preventing misuse outside the lifecycle.

---

### 5. Data Modeling Strategy

- `Agent` and `Property` → referenced (ObjectId)
- `Transaction` → central aggregate
- `CommissionBreakdown` → embedded snapshot
- `AgentSnapshot` → embedded for historical accuracy
- `stageHistory` → embedded audit trail

---

## 🧪 API Endpoints

```http
POST   /api/transactions
GET    /api/transactions
GET    /api/transactions/:id
PATCH  /api/transactions/:id/stage

GET    /api/agents
GET    /api/properties
```

---

## 🖥️ Frontend

The UI reflects backend state rather than enforcing rules.

### Pages

- `/` → Dashboard (metrics + summary)
- `/transactions` → Transaction list
- `/transactions/[id]` → Detail view

### Features

- Stage stepper driven by backend state
- Commission breakdown appears only after completion
- Human-readable mapping via agent/property lookup

---

## ▶️ Getting Started

### 1. Install dependencies

```bash
pnpm install
```

---

### 2. Run backend

```bash
cd backend
pnpm run start:dev
```

---

### 3. Run frontend

```bash
cd frontend
pnpm run dev
```

---

### 4. Seed data (optional)

Use the UI or API to create:

- agents
- properties
- transactions

---

## 🧪 Run Tests

```bash
cd backend
pnpm run test
```

Includes:

- Commission logic tests
- Transaction lifecycle tests

---

## 📄 Design Decisions

Detailed architectural decisions are documented in:

```text
DESIGN.md
```

This includes:

- Schema modeling trade-offs
- State machine design
- Commission snapshot reasoning
- Module boundaries

---

## 🎯 Key Takeaways

This project is intentionally designed to demonstrate:

- Modeling workflows as **state machines**
- Applying **snapshot-based financial consistency**
- Enforcing **domain rules at the service layer**
- Maintaining **clean architecture boundaries**

---

## 📌 Notes

- Commission uses standard JS numbers for simplicity
- In production, fixed-point/decimal handling would be preferred
- The system prioritizes **correctness over feature breadth**

---

## 👤 Author

Built as part of a full-stack engineering case study.
