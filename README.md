# Document Analysis & Quote API

A Backend project created with node and express to run server and PrismaPostgres as backend and prisma ORM

---

## Suggested Project Structure

```
controllers/   # Route controllers (request handling & response wrappers)
routes/        # Express router path definitions
services/      # Business logic & external API integrations (FastAPI client)
utils/         # Custom error and response helper classes (apiError, apiResponse)
prisma/        # Database schema models and migrations
```

---

## Validation & Error Handling Summaries

### Validation (Request Inputs)
Before processing requests, the server validates:
*   **Missing Customer/Project**: Checks that fields are present and are non-empty strings.
*   **Negative Estimated Value**: Ensures value is positive (`value > 0`).
*   **Invalid Status**: Rejects any status not matching the `StatusCondition` enum keys (`New`, `In Review`, `Needs Info`, `Completed`).

### Error Handling
Errors are caught gracefully using a global structure:
*   **Quote Not Found**: Responds with a `404 Not Found` code.
*   **FastAPI Unavailable**: Wraps the network timeout or rejection in a `502 Bad Gateway` error.
*   **Invalid Request**: Responds with `400 Bad Request` explaining the validation failure.
*   **Database Failure**: Returns a generic `500 Internal Server Error` protecting database internals.

---

## Design Questions

### Q1. Why did you separate controllers, services and repositories?
From my experience and on how many projects i work i found that mismanagement one of the main issue why most of the efficiency decreases maintaing the files its location name sound hassle cuz u have to do this everytime but in BIG PICTURE these things matter the most, not only this even i created sements in my device storage liek C only for os works essential software and drivers like vsCode,Blender and etc while i store ny codes, games, documents, hobby apps(premier,photoshop) in d drive so, seprating controllers services and repositories are necessary.

### Q2. If FastAPI takes 30 seconds to respond, should the client wait? If not, what would you do?
Since client only interacts with the frontend we can use skeleton progressive illustration apperance this work as a progressive bar but the skeleton or dummy loads in on the webpage make the user that its taking time and engage the user in an activity where the user can get the rough estimation about how long will it take so if there is no urgency user wait or drop the task if needed

### Q3. Suppose FastAPI returns invalid JSON. How should your backend behave?
Using try catch and wrapping the code in this block helps a lot handling the error if occured in the FastAPI it handles this gracefully and excute and returns the response accordingly 

for this i created apiResponse apiError ("thanks to hiteshChaudhary Sir") i use this to handle and take some customiztion like message in my own hand which i directly provide to the client side

### Q4. If there are 500,000 quote requests, how would you improve performance?
System design concept implemts here
first and foremost creating read only replica of database anb a load balance on top of that for request handling if somehow we get more request and need to split the primary database we can also do that having multple database and using consistent hashing we can share the data in between and only invoke the database which holds the specific data query 

we can also use redis for caching.
### Q5. Suppose two users update the same quote simultaneously. How would you prevent inconsistent data?
For a race condition between read and write we can use event sourcing with CQRS pattern and split the databases read and write,

but for a race condition between two writes we can use a queue base approach and on each write we can block that particular row for getting updating eleminate the inconsistecy of data

### Q6. Would you store every FastAPI analysis or only the latest? Explain.
 Depends but storing the latest is most optimal and best

### Q7. Where would you place business rules (controller, service or database)? Why?
*   **Service Layer**: Business rules belong in the **service layer**. Controllers should only handle request parsing and responses. Databases should focus on data persistence and basic referential integrity. Keeping rules in the service layer ensures they can be reused across different interfaces (e.g. REST API, CLI tools, cron tasks) and are easy to unit-test.

---

## AI Usage Reflection

1.  **Did you use AI tools?**
    *   Yes, Google Antigravity was used for analysis over the project like i wrote some code then ask antigravity about the errors and missing typesafety.
2.  **Which sections used AI?**
    *   Used AI for identifying TypeScript configuration mismatch issues (`TS6059`), resolving type assignments under strict optional property modes, and formulating architectural strategies.
    * In this readme use AI
3.  **What did you implement yourself?**
    *   Implemented Express controllers, validation checks, error-throwing methods, parameter mapping (String to Int), and database schema designs.
4.  **What design decisions were yours?**
    *   Selecting SQLite for zero-configuration local database development.
    *   Mapping space-formatted statuses (`In Review`) to standard PascalCase enum properties (`InReview`) in the controller.
5.  **What would you improve if you had one more day?**
    *   Implement an API validation middleware using a library like Zod or Joi.
    *   Add comprehensive unit tests for the controller methods.
    *   Set up a mock server for FastAPI using MSW or Nock.
