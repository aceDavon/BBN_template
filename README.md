## NodeJS Boilerplate application with Authentication.

This application is a boilerplate Node.js backend built with TypeScript. It includes user authentication using HTTP-only cookies, database operations with PostgreSQL, and a migration system for managing database schema changes.


## Features

  **1. User Authentication**

  - Register users with a username, email, and password.

  - Login functionality with HTTP-only cookie-based authentication.

  - Middleware for protecting routes using session cookies.

  **2. Database Integration**

  - Singleton database class for PostgreSQL with helper methods (query, findAll, findOne, findOrFail, etc.).

  - Support for dynamic query building to filter models based on parameters like dates, usernames, or relationships.

  **3. Migration System**

  - Command-line tool to generate and manage migration files.

  - Automatically includes basic columns: id, created_at, and updated_at.

  - Uses the database singleton for migration queries.

  **4. Folder Structure**

  - Organized into controllers, services, and repositories for scalability and separation of concerns.

  **5. Environment Configuration**

  - .env file support for managing sensitive configuration like database connection strings and JWT secrets.

  **6. Package Management**

  - Uses Yarn for dependency management.

## Installation

### Prerequisites

  - Node.js (v18.x or later)

  - PostgreSQL

  - Yarn

### Setup

  1. Clone the repository:

  ```bash
    git clone https://github.com/aceDavon/node-app-boilerplate.git
    cd node-app-boilerplate
  ```

  2. Install dependencies:

  ```bash
    yarn install
  ```

  3. Create a `.env` file in the root directory with the following variables:

  ```json
    PORT=3000
    DATABASE_URL=postgres://<username>:<password>@<host>:<port>/<database>
    JWT_SECRET=<your_jwt_secret>
    COOKIE_SECRET=<your_cookie_secret>
  ```

  4. Run database migrations:

  ```bash
    yarn migrate:up
  ```

  5. Start the development server:

  ```bash
    yarn dev
  ```