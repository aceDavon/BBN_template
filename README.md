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

## Folder Structure

```
project-root/
├── src/
│   ├── controllers/        # Handles HTTP requests
│   ├── services/           # Business logic
│   ├── repositories/       # Data access logic
│   ├── database/           # Singleton database instance
│   ├── middlewares/        # Express middleware
│   ├── migrations/         # Database migrations
│   ├── routes/             # API route definitions
│   └── utils/              # Utility functions
├── scripts/                # Helper scripts (e.g., migrations)
├── .env                    # Environment variables
├── tsconfig.json           # TypeScript configuration
├── package.json            # Project metadata and scripts
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