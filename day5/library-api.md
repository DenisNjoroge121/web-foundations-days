
# Library Books REST API

## Overview

This REST API manages books in a library system.

**Base URL:** `/api/v1`

**Resource:** `/books`

**Content-Type:** `application/json`

## 1. List all books

- **Method:** GET
- **Path:** `/api/v1/books`
- **Description:** Retrieves a list of all books.
- **Example request body:** None.
- **Success status:** `200 OK`

Example response:

```json
[
  {
    "id": 1,
    "title": "Things Fall Apart",
    "author": "Chinua Achebe",
    "publishedYear": 1958
  }
]
```

## 2. Get one book

- **Method:** GET
- **Path:** `/api/v1/books/{id}`
- **Description:** Retrieves a single book using its ID.
- **Example request body:** None.
- **Success status:** `200 OK`

Example path:

`GET /api/v1/books/1`

## 3. Create a book

- **Method:** POST
- **Path:** `/api/v1/books`
- **Description:** Adds a new book to the library.
- **Success status:** `201 Created`

Example request body:

```json
{
  "title": "The River Between",
  "author": "Ngugi wa Thiong'o",
  "publishedYear": 1965
}
```

## 4. Update a book

- **Method:** PUT
- **Path:** `/api/v1/books/{id}`
- **Description:** Replaces the details of an existing book.
- **Success status:** `200 OK`

Example request:

`PUT /api/v1/books/1`

Example request body:

```json
{
  "title": "Things Fall Apart",
  "author": "Chinua Achebe",
  "publishedYear": 1958
}
```

## 5. Delete a book

- **Method:** DELETE
- **Path:** `/api/v1/books/{id}`
- **Description:** Deletes a book using its ID.
- **Example request body:** None.
- **Success status:** `204 No Content`

Example request:

`DELETE /api/v1/books/1`

A successful deletion returns no response body.

## 6. List books by author

- **Method:** GET
- **Path:** `/api/v1/books?author={author}`
- **Description:** Retrieves books written by the specified author.
- **Example request body:** None.
- **Success status:** `200 OK`

Example request:

`GET /api/v1/books?author=Chinua%20Achebe`

Example response:

```json
[
  {
    "id": 1,
    "title": "Things Fall Apart",
    "author": "Chinua Achebe",
    "publishedYear": 1958
  }
]
```

## Error Responses

### 400 Bad Request

- **Meaning:** The request contains invalid data or parameters.
- **Example:** A POST request submits a book without the required title.
- **Example response:**

```json
{
  "error": "Bad Request",
  "message": "The title field is required."
}
```

### 404 Not Found

- **Meaning:** The requested resource does not exist.
- **Example:** A client requests `/api/v1/books/999` when no book has ID 999.
- **Example response:**

```json
{
  "error": "Not Found",
  "message": "Book not found."
}
```
