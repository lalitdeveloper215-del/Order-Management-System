# Order Management System (OMS)

A production-ready mini OMS demonstrating scalable backend architecture, data consistency under concurrency, asynchronous processing, and advanced React patterns.

## Architecture

* **Backend**: Node.js, Express, TypeScript
  * Designed using Controller -> Service -> Repository pattern for separation of concerns.
  * Centralized error handling using `Zod` for validation.
  * Robust database interaction explicitly using row-level locking (`FOR UPDATE`) to strictly prevent inventory overselling.
* **Asynchronous Jobs**: BullMQ and Redis
  * When an order is created, the system publishes an event to BullMQ, decoupling email/notification firing from the immediate HTTP response, ensuring fast endpoint responses.
* **Database**: PostgreSQL
  * Tables: `products`, `orders`, `order_items`. Indexed for fast pagination and filtering.
* **Frontend**: React (Vite) + Redux Toolkit
  * Deep use of standard and performance Hooks (`useCallback`, `useMemo`, `usePagination`).
  * Custom context structure for handling environments.
  * Strict Vanilla CSS adhering to modern "glassmorphic" design philosophies.

## Setup Instructions

### Prerequisites
1. Node.js (v18+)
2. PostgreSQL
3. Redis Server

### Backend Setup
1. Open a terminal, navigate to `backend/`.
2. Initialize the database, apply the schema, and seed test data by running:
   ```bash
   npm run db:init
   ```
   When you run this command, it successfully generates the requested test data:
   * **Products:** 50 new test products
   * **Orders:** 1,500 new test orders
   * **Order Items:** 2,247 test order items associated with those orders
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server (and worker):
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Open a terminal, navigate to `frontend/`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite server:
   ```bash
   npm run dev
   ```
4. Access the portal at `http://localhost:5173`.

## API Documentation (Swagger)
The API definitions are documented. Once the backend server is running, visit:
[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Concurrency & Testing Scenarios
### Overselling Prevention
The backend safely locks (`FOR UPDATE`) rows exclusively when processing orders.
You can simulate an integration failure where **stock cannot be fulfilled** by attempting to buy more quantity than available natively on the `OrderCreation` interface. The backend will abort the transaction without deducting partial quantities and respond securely. 

- Submitting large requests in rapid succession will queue the requests at the database engine level until the lock is released per connection transaction context, preventing race conditions from occurring.
