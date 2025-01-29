## NodeJS Boilerplate application with Authentication.

This application is a Node.js boilerplate backend built with TypeScript. It supports user authentication via HTTP-only cookies, dynamic database operations with PostgreSQL, a migration system, and a service container for managing dependencies.


## Features

  **1. User Authentication**

  - Register users with a username, email, and password.

  - Login functionality with HTTP-only cookie-based authentication.

  - Middleware for protecting routes using session cookies.

  **2. Dynamic Database Integration**

  - Singleton database class with helper methods (`query`, `findAll`, `findOne`, `findOrFail`).
  - Dynamic query builder for filtering models (date ranges, usernames, relationships, etc.).
  - Abstracted dynamic database initialization via a service container.

  **3. Migration System**

  - Command-line tool to generate and manage migration files.

  - Automatically includes basic columns: id, created_at, and updated_at.

  - Uses the database singleton for migration queries.

  **4. Service Container**

  - Centralized dependency management with support for singleton or non-singleton services.
  - Simplifies dependency resolution and promotes modular design.
  **5. Folder Structure**

  - Features encapsulated under `app/features`.
  - Centralized utilities in src/app/utils (e.g., service container).
  - Modular organization for scalability.

  **6. Environment Configuration**

  - .env file support for managing sensitive configuration like database connection strings and JWT secrets.
  - Docker for containerized environments.
  - Kubernetes support for production deployment.

  **7. Package Management**

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

## Folder Structure

```
project-root/
├── src/
│   ├── app/
│   │   └── features/       # Feature modules
│   │   └── utils/          # Utility modules(e.g., service container)
│   ├── controllers/        # Request handlers
│   ├── repositories/       # Data access logic
│   ├── database/           # Singleton database instance
│   │   └── db.ts           # Dynamic database logic
│   ├── middlewares/        # Express middleware
│   ├── migrations/         # Database migrations
│   ├── routes/             # API routes
│   └── utils/              # Utility functions
├── scripts/                # Migration scripts
├── .env                    # Environment variables
├── tsconfig.json           # TypeScript configuration
└── README.md               # Documentation
```

## API Endpoints

### Authentication

**Register**

  - **Endpoint:** POST /auth/register

  - **Description:** Create a new user.

  - **Request Body:**

    ```json
      {
        "username": "string",
        "email": "string",
        "password": "string"
      }
    ```
  - **Reponse:**

    ```json
      {
        "message": "User registered successfully."
      }
    ```

**Login**

  - **Endpoint:** POST /auth/login

  - **Description:** Authenticate a user and set an HTTP-only cookie.

  - **Request Body:**

      ```json
        {
          "email": "string",
          "password": "string"
        }
      ```

  - **Response:**

    ```json
      {
        "message": "Login successful."
      }
    ```

  - **Cookies:**

    - An HTTP-only cookie named auth_token will be set with the session token.

**Logout**

  - **Endpoint:** POST /auth/logout

  - **Description:** Log the user out and clear the HTTP-only cookie.

  - **Response:**

    ```json
      {
        "message": "Logout successful."
      }
    ```

### Protected Routes

- **Example**

    - **Endpoint:** GET /protected

    - **Description:** Example of a protected route that requires a valid session.

  - **Cookies:** The auth_token cookie must be sent with the request.

- **Response:**

  ```json
    {
      "message": "Access granted."
    }
  ```

## Database Management

### Migration Commands

**Generate Migration**

  - **Command:**

    ```bash
      yarn generate-migration <ModelName>
    ```

  - **Description:** Generates a migration file with the basic table structure for the specified model.

**Run Migrations**

  - **Command:**

    ```bash
      yarn migrate:up
    ```

  - **Description:** Applies all pending migrations.

**Revert Migrations**

  - **Command:**

    ```bash
      yarn migrate:down
    ```

  - **Description:** Reverts all applied migrations.

## Dynamic Database Management
**Helper Methods**

1. `query`: Execute raw SQL queries.

    ```typescript
    await db.query('SELECT * FROM users');
    ```
2. `findAll`: Retrieve all records.

    ```typescript
    const users = await db.findAll('users');
    ```
3. `findOne`: Retrieve a single record by criteria.
    ```typescript
    const user = await db.findOne('users', { email: 'example@example.com' });
    ```
4. `findOrFail`: Retrieve a record or throw an error.

    ```typescript
    const user = await db.findOrFail('users', { id: 'uuid' });
    ```
5. `filter`: Dynamic query builder.
    ```typescript
    const results = await db.filter('users', {
      dateRange: { from: '2023-01-01', to: '2023-12-31' },
      username: 'john_doe',
    });
    ```

**Dynamic Database Initialization**

  ```typescript
    import { IDatabase } from 'src/types/dbInterface';
    import PgAdapter from './adapters/pgDB';

    export const getDatabase = <T>(): IDatabase<T> => {
      const dbType = process.env.DB_TYPE;

      switch (dbType) {
        case 'postgres':
          return PgAdapter.getInstance<T>();
        default:
          throw new Error(`Unsupported database type: ${dbType}`);
      }
    };

    export const db = getDatabase<Record<string, any>>();
  ```

## Using the Application

1. **Register a User:**
Send a POST request to /auth/register with user details.

1. **Login:**
Authenticate using /auth/login. The server will set an HTTP-only cookie.

1. **Access Protected Routes:**
Include the auth_token cookie in your requests to access protected endpoints.

1. **Logout:**
Clear the authentication session by sending a POST request to /auth/logout.

1. **Database Querying:**
Use the database singleton instance (db) to run queries programmatically or interact with models dynamically.

## Helper Methods in Database Singleton

1. `query`: Execute raw SQL queries.\
  ```js await db.query('SELECT * FROM users');```
1. `findAll`: Retrieve all records from a table.\
  ```js const users = await db.findAll('users');```
1. `findOne`: Retrieve a single record by ID or criteria.\
  ```js const user = await db.findOne('users', { email: 'example@example.com' });```
1. `findOrFail`: Retrieve a record or throw an error if not found.\
  ```js const user = await db.findOrFail('users', { id: 'uuid' });```
1. Dynamic Query Builder: Filter records based on dynamic criteria.
        ```js 
          const results = await db.filter('users', {
          dateRange: { from: '2023-01-01', to: '2023-12-31' },
          username: 'john_doe'
          });
        ```

## Contributing

1. Fork the repository.

1. Create a new branch: git checkout -b feature-name.

1. Commit your changes: git commit -m 'Add feature'.

1. Push to the branch: git push origin feature-name.

1. Open a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details