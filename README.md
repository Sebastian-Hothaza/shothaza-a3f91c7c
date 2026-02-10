# Task Management System (NX Monorepo)

This project is a full-stack, task management system built using an NX monorepo.  
It demonstrates authentication, role-based access control (RBAC), organizational hierarchy, and secure API design.  
It features a simple UI for task CRUD support.

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm
- Docker + Docker Compose
- NX CLI (optional)

---

## Database Setup (PostgreSQL via Docker)

The project uses PostgreSQL running in a Docker container for local development.

### Start the database and seed it

At the **root of the repository**, run

`docker compose up -d`

Insert sample data with `npx nx seed api`

## BackEnd Setup (NestJS)

For simplicity and ease of setup, environment variables are configured directly in code rather than via `.env` files. CORS has also been configured without restriction for development purposes.


At the **root of the repository**, run

`npx nx serve api`

The API will be accessible at `http://localhost:3001/api`

## FrontEnd Setup (Angular V21)

Front end consists of a simple dashboard UI featuring a login page and task view page which allows CRUD operations on tasks.

At the **root of the repository**, run

`npx nx serve dashboard`

The dashboard will be accessible at `http://localhost:4200`

## Architecture Overview

This repo uses NX’s modern project-based configuration, which keeps each app and library self-contained while still benefiting from shared code and caching.

## Data Model Explanation

### Core Entities

**User**

**Organization** (supports 2-level parent–child hierarchy)

**UserOrganization** (membership with role)

**Task**

### Relationships

A User can belong to multiple Organizations

An Organization can have child Organizations

Tasks belong to exactly one Organization

Access to Tasks is determined by Organization membership

## Access Control Implementation

### Roles

```
OWNER

ADMIN

VIEWER
```

### Enforcement Strategy

JWT authentication identifies the user (WHO is attempting access)

RBAC guards enforce role checks at the controller level

Organization access is validated server-side

Tasks are always scoped to the user’s organization

### JWT Integration

The JWT payload includes:

**User ID**

**Email**

**Organization memberships** (organization ID + role)

The backend derives organization context and enforces ownership rules.
The frontend never controls or submits organization ownership data.

### API Documentation

**Authentication**

*Log In*  
Submit a `POST` request to `/api/auth/login`. Sample:
```json
{
  "email": "alice@owner.com",
  "password": "password123"
}
```
*Verify authorization*  
Submit a `GET` request to `/api/auth/me` with jwt attached

*Log out*  
Submit a `POST` request to `/api/auth/logout` with jwt attached. API will clear http-only cookie.

**Tasks**

*Create a task*  
Submit a `POST` request to `/api/tasks` with jwt attached. Sample:
```json
{
  "title": "Apple Inc - Quarterly Review",
  "category": "2026 Q1"
}
```

*Get all tasks*  
Submit a `GET` request to `/api/tasks` with jwt attached

*Edit a task*  
Submit a `POST` request to `/api/tasks/:id` with jwt attached

*Delete a task*  
Submit a `DELETE` request to `/api/tasks/:id` with jwt attached

**Logs**

*Get all logs*  
Submit a `GET` request to `/api/logs` with jwt attached

### Future Considerations

JWT refresh tokens should be added to increase convenience & security.