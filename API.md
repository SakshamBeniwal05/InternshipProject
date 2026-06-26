# API Documentation

This document outlines the REST API endpoints available in the Document Analysis & Quote service, based on the provided Postman collection.

---

## Base URL

```text
http://localhost:3000/api
```

---

## Endpoints

### 1. Create a Quote Request

Creates a new quote request in the database.

*   **URL**: `/quotes` (Also accepts `/quotes/create` in Postman)
*   **Method**: `POST`
*   **Body Type**: `JSON` (or `form-data`)
*   **Request Body**:
    

```json
    {
      "customer": "Ramesh",
      "project": "Oneplus",
      "status": "New",
      "estimatedValue": 50000
    }
    ```

*   **Success Response (201 Created)**:
    

```json
    {
      "success": true,
      "statusCode": 201,
      "data": {
        "quote": {
          "id": 1,
          "customer": "Ramesh",
          "project": "Oneplus",
          "status": "New",
          "estimated_value": 50000,
          "created_date": "2026-06-26T23:07:05.000Z"
        }
      },
      "message": "Quote created successfully"
    }
    ```

* **Screenshot Referance**
    

![Update Status Success](api/screenshots/Screenshot%202026-06-26%20230823.png)

---

### 2. Get All Quotes

Retrieves a list of all quotes along with their linked analysis results.

*   **URL**: `/quotes`
*   **Method**: `GET`
*   **Success Response (200 OK)**:
    

```json
    {
      "success": true,
      "statusCode": 200,
      "data": {
        "allQuotes": [
          {
            "id": 1,
            "customer": "Ramesh",
            "project": "Oneplus",
            "status": "New",
            "estimated_value": 50000,
            "created_date": "2026-06-26T23:07:05.000Z",
            "analysis": null
          },
          {
            "id": 2,
            "customer": "Graham",
            "project": "Happier",
            "status": "inreview",
            "estimated_value": 500,
            "created_date": "2026-06-26T15:27:46.072Z",
            "analysis": {
                "id": "b1b91415-1a4f-400b-98c5-0558a8ffbaa5",
                "quote_id": 2,
                "risk": "Medium",
                "confidence": 50,
                "missing_items": [
                    "Structural drawings",
                    "Load requirements"
                ],
                "analyzed_at": "2026-06-26T17:38:04.896Z"
              }
            }
        ]
      },
      "message": "succesful api"
    }
    ```

*   **Screenshot Reference**:
   

![Get All Quotes](api/screenshots/Screenshot%202026-06-26%20230748.png)

---

### 3. Get Quote Details (Search by ID)

Retrieves detailed information for a single quote, including its FastAPI document analysis report.

*   **URL**: `/quotes/:id`
*   **Method**: `GET`
*   **Success Response (200 OK)**:
    

```json
    {
      "success": true,
      "statusCode": 200,
      "data": {
        "quote": {
          "id": 1,
          "customer": "Ramesh",
          "project": "Oneplus",
          "status": "New",
          "estimated_value": 50000,
          "created_date": "2026-06-26T23:07:05.000Z",
          "analysis": {
            "id": "e963b51e-ad5d-45db-b956-fbf3be0d061f",
            "quote_id": 1,
            "risk": "Medium",
            "confidence": 91,
            "missing_items": [
              "Structural drawings",
              "Load requirements"
            ],
            "analyzed_at": "2026-06-26T23:07:48.000Z"
          }
        }
      },
      "message": "succesful api"
    }
    ```

*   **Screenshot Reference**:
    

![Get Quote by ID](api/screenshots/Screenshot%202026-06-26%20230718.png)

---

### 4. Analyze Quote Documents (FastAPI Integration)

Triggers document analysis via the FastAPI service, stores the results locally, and returns the combined analysis and quote status.

*   **URL**: `/quotes/:id/analyze`
*   **Method**: `POST`
*   **Success Response (200 OK)**:
    

```json
    {
      "success": true,
      "statusCode": 200,
      "data": {
        "quote": {
          "id": 1,
          "customer": "Ramesh",
          "project": "Oneplus",
          "status": "New",
          "estimated_value": 50000,
          "created_date": "2026-06-26T23:07:05.000Z"
        },
        "report": {
          "id": "e963b51e-ad5d-45db-b956-fbf3be0d061f",
          "quote_id": 1,
          "risk": "Medium",
          "confidence": 91,
          "missing_items": [
            "Structural drawings",
            "Load requirements"
          ],
          "analyzed_at": "2026-06-26T23:07:48.000Z"
        }
      },
      "message": "Quote analysis completed successfully"
    }
    ```

*   **Screenshot Reference**:
  

![Analyze Quote](api/screenshots/Screenshot%202026-06-26%20230810.png)

---

### 5. Update Quote Status

Updates the progress state of an existing quote. The status is validated against allowed values.

*   **URL**: `/quotes/:id/status`
*   **Method**: `PATCH`
*   **Request Body**:
    

```json
    {
      "status": "In Review"
    }
    ```

    *(Allowed values: `"New"` , `"In Review"` , `"Needs Info"` , `"Completed"` )*

*   **Success Response (200 OK)**:
    

```json
    {
      "success": true,
      "statusCode": 200,
      "data": {
        "quote": {
          "id": 1,
          "customer": "Ramesh",
          "project": "Oneplus",
          "status": "In Review",
          "estimated_value": 50000,
          "created_date": "2026-06-26T23:07:05.000Z"
        }
      },
      "message": "Quote status updated successfully"
    }
    ```

*   **Screenshot References**:
    

![Update Status](api/screenshots/Screenshot%202026-06-26%20230705.png)
