# Backend Development Guidelines

## Project Structure
```
be/
├── app.js                 # Main application entry point
├── controllers/          # Business logic for routes
├── middleware/          # Custom middleware functions
├── models/              # Mongoose models
├── routes/             # Route definitions
└── scripts/            # Utility scripts (e.g., seeding)
```

## Code Style & Conventions

### General
- Use ES6+ features but maintain CommonJS (`require`/`exports`) module syntax
- Use meaningful, descriptive variable and function names
- Keep functions focused and single-purpose
- Use async/await for asynchronous operations
- Always include error handling in try/catch blocks
- Use consistent error response formats

### Variables & Functions
- Use camelCase for variables and function names
- Use PascalCase for model names
- Prefix boolean variables with question words (is, has, should)
- Use verb prefixes for function names (get, create, update, delete)
- Use const for imports and variables that won't be reassigned
- Use let only when variable reassignment is necessary

### Models
- Use singular, PascalCase names for models (e.g., `User`, `Organization`)
- Define schemas with explicit types and validation
- Include timestamps (`createdAt`, `updatedAt`) on all models
- Use pre-save middleware for data transformation
- Define instance methods using schema.methods
- Use virtuals for computed properties

### Controllers
- Use descriptive function names that match their route purpose
- Follow RESTful naming conventions
- Structure controller functions consistently:
  1. Input validation
  2. Data retrieval/manipulation
  3. Response formatting
- Return standardized response objects
- Handle all potential error cases

### Routes
- Group related routes in separate files
- Use middleware for authentication and validation
- Keep route handlers thin, delegate logic to controllers
- Use consistent route naming patterns
- Include route comments describing the endpoint

### Error Handling
- Use HTTP status codes appropriately:
  - 200: Success
  - 201: Created
  - 400: Bad Request
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not Found
  - 500: Server Error
- Include meaningful error messages
- Log errors appropriately
- Don't expose sensitive information in error responses

## API Response Format

### Success Response
```javascript
{
  data: {}, // Response data
  message: "Optional success message"
}
```

### Error Response
```javascript
{
  error: "Error message",
  details: {} // Optional additional error details
}
```

## Authentication & Authorization
- Use JWT for authentication
- Include auth middleware for protected routes
- Store tokens in Authorization header
- Implement token refresh mechanism
- Validate user permissions in middleware

## Database Operations
- Use Mongoose for MongoDB interactions
- Include proper indexing for frequently queried fields
- Use lean() for read-only operations
- Implement proper data validation
- Use transactions for related operations

## Environment & Configuration
- Use .env for environment variables
- Never commit sensitive information
- Use configuration files for environment-specific settings
- Set appropriate default values

## Testing
- Write unit tests for models and controllers
- Use integration tests for API endpoints
- Mock external services and database calls
- Test error scenarios and edge cases

## Security
- Sanitize user inputs
- Implement rate limiting
- Use CORS appropriately
- Hash sensitive data (passwords)
- Validate file uploads
- Implement request size limits

---

## AI Rules Section

### Code Generation Rules
1. ALWAYS:
   - Use try/catch for async operations
   - Include auth middleware for protected routes
   - Follow established naming patterns
   - Return standardized response objects
   - Handle null/undefined cases
   - Validate inputs
   - Use proper HTTP status codes
   - When accessing a list endpoint, filter by the auth user's organization

2. PATTERNS:
   - Controllers: `exports.functionName = async (req, res) => {}`
   - Routes: `router.method('/path', middleware, controller.function)`
   - Models: `const modelSchema = new mongoose.Schema({...})`
   - Auth: `{ authenticateToken: auth }`
   - Error Format: `{ error: message }`
   - Success Format: `{ data: result }`

3. NAMING:
   - Routes: noun-based ('/users', '/organization')
   - Controllers: action-based (getUser, createMember)
   - Variables: camelCase
   - Models: PascalCase

4. VALIDATION:
   - Required Fields: `required: true`
   - String Fields: `trim: true`
   - Enums: Define allowed values
   - Dates: Default to `Date.now`

5. ERROR HANDLING:
   - 400: Invalid input
   - 401: Authentication failed
   - 403: Permission denied
   - 404: Resource not found
   - 500: Server error

6. SECURITY:
   - Never expose passwords
   - Always hash sensitive data
   - Validate user permissions
   - Check organization access

7. DATABASE:
   - Use proper indexes
   - Include timestamps
   - Reference related models
   - Handle cascade operations
