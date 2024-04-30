# API

## Authentication endpoints

The API has the following authentication endpoints:

```
    POST /api/auth/login - Login
    POST /api/auth/logout - Logout
    POST /api/auth/refresh - Refresh token
    POST /api/auth/change-password - Change password
    POST /api/auth/user - Get user
```

The `login` endpoint is used to authenticate a user and generate an access token and a refresh token. The access token is used to authenticate requests to the API, and the refresh token is used to generate a new access token when the access token expires in the `refresh` endpoint.

The `change-password`, `user` and `logout` endpoints can be used only by the user who is authenticated.

## Data endpoints

The API has the following data endpoints:

```
    GET /api/:model - Get many
    GET /api/:model/:id - Get one
    GET /api/:model/:id/[:field] - Get one field
    GET /api/:model/export - Export with query

    PUT /api/:model - Update one or many
    PUT /api/:model/:id - Update one

    POST /api/:model - Create one or many
    POST /api/:model/query - Get one or many with query
    POST /api/:model/:id/[:field]/query - Get one with query or Get one field with query
    POST /api/:model/:id/upload - Upload media (only available for Concept model)
    POST /api/:model/import - Import all (only available for Concept model)

    DELETE /api/:model/:id - Delete one
    DELETE /api/:model/query - Delete one or many with query
```

Which endpoint can be with the `public` prefix:

```
    GET /api/public/:model - Get many
    GET /api/public/:model/:id - Get one
    ...
```

When `public` is appended after `api`, the endpoint is public and does not require authentication. Only the `GET` method is allowed for public endpoints. Only published records are returned in the response.

To use the non-public endpoints, it is necessary to authenticate using the `POST /api/auth/login` endpoint. The endpoint send two cookies in the response: `csrf` and `jwt`. The `csrf` cookie is used to prevent CSRF attacks, and the `jwt` cookie is used to authenticate requests to the API. All the subsequent requests to the API must include the `csrf` and `jwt` cookies and the `X-CSRF-Token` header with the value of the `csrf` cookie.

### Endpoint paths

-   `:model`: The name of the model. Example: `concept` or `Concept`.
-   `:id`: The identifier of the record, which is any unique field of the model (@unique in the schema). Example, `1` or `slug`.
-   `[:field]`: The any related field of the record. Example: `parent` or `translations`.
-   `query`: the query object to filter records sent in the request body. Details in the next section.
-   `upload`: the media file to upload. Only available for the `Concept` model.
-   `import`: data to import. Only available for the `Concept` model.
-   `export`: the query object to filter records sent in the query string. It has a `format` attribute to specify the format of the export file.

## Query object

The API supports a query object to filter records. The query object can be sent in the request body for the `POST` method or in the query string for the `GET` method. The query object can contain the following properties:

### select

An array of fields to include in the response. Default response include all attributes of the model (scalar fields).

Example:

```json
{
    "select": ["title", "createdAt"]
}
```

### where

An object to filter records. The object can contain the following operators:

-   `=`, `eq`: Equal to.
-   `!=`, `not`: Not equal to.
-   `>`, `gt`: Greater than.
-   `<`, `lt`: Less than.
-   `>=`, `gte`: Greater than or equal to.
-   `<=`, `lte`: Less than or equal to.
-   `contains`, `like`: Contains.
-   `notlike`: Not like.
-   `startsWith`, `start`: Starts with.
-   `endsWith`, `end`: Ends with.
-   `in`: In.
-   `notIn`: Not in.
-   `equals`: Equals.
-   `isNull`: Is null. The value can be `true` or `false`.

If operators are not specified, the API will use the `=` operator to string fields and the `in` operator to array fields.

Examples:

```json
  {
    "where": { "name": { "like": "John" } }
  }

  {
    "where": { "id": 1 }
  }
```

### orderBy

An object to order records. The object can contain the field name and the order direction. The order direction can be `asc` or `desc`. Default is `asc` and order by `name` (if exists).

Examples:

```json
  {
    "orderBy": { "name": "asc" }
  }

  {
    "orderBy": { "name": "asc", "createdAt": "desc" }
  }

  {
    "orderBy": { "author": { "name": "desc" } }
  }
```

### include

An array or object to include related records. The array can contain the field names of the related records to include in the response. The object can contain the `orderBy`, `select`, and `where` properties. To include all related fields, use the `*` character.

Examples:

```json
  {
    "include": ["author"]
  }

  {
    "include": "*"
  }

  {
    "include": ["author", "references"]
  }

  {
    "concepts": {
        "include": {
            "media": {
                "orderBy": ["position"]
              }
          }
      }
  }
```

-   `page`: The page number to return. Example: `1`.
-   `pageSize`: The number of records to return per page. Example: `10`. Use `-1` to return all records.

## Request body

The request body can contain the following properties:

-   The fields of the record to create or update.
-   The `_action_` attribute to specify the action to perform on the record.

### Example

```json
{
    "title": "New concept",
    "author": {
        "name": "John Doe"
    }
}
```

### Related records: id vs object

-   The `<field>Id` has precedence over the `<field>` when both are present in the request body. For example, if both `author` and `authorId` are present in the request body, the API will use the `authorId` field to associate the record with the `Author` record, and ignore the `author` field. Otherwise, the API will use the `author` field to associate the record with the `Author` record.

### The `_action_` attribute

The available actions are:

-   `create`: Create a new related record.
-   `update`: Update an existing related record.
-   `connect`: Connect an existing related record.

When creating or updating a record, related records can be included in the request body. The API will automatically create or update the related records based on the request body.
For example, when creating a new `Concept` record, a `Reference` record can be include in the request body. The API will automatically create the `Reference` record and associate it with the new `Concept` record. If the `id` field is included in the `Reference` record, the API will connect the `Reference` record to the `Concept` record using the `id` field. The same behavior applies when updating a record.

To update a related record, the `_action_` attribute needs to be sent in the request body to specify the action to be performed. For example, a `Reference` record can be updated by creating a new `Concept` record if the `_action_` attribute is present in the request body with the value `update`. In the example below, the `Reference` record will be updated with the new title:

```json
{
    "title": "New concept",
    "reference": {
        "id": 1,
        "title": "New reference",
        "_action_": "update"
    }
}
```

### Limitations

Related records are limited to one level of nesting. For example, a `Reference` record can be updated or created when creating or updating an `Concept` record, but it is not possible to create a related `Reference` record when creating or updating a related `Concept` record. To create or update related records beyond one level of nesting, only the `connect` action is supported, the target related record must be created or updated separately.

### Batch update and delete

The API supports batch update for the `PUT` method. It is possible to update multiple records at once by sending an array of records in the request body. In this case, the request body should contain a `where` clause to filter records to update and a `data` object to update records. Example:

```json
{
    "where": { "id": [1, 2] },
    "data": { "status": "published" }
}
```

The API supports batch delete for the `DELETE` method. It is possible to delete multiple records at once by sending an array of records in the request body. In this case, the request body should contain an `where` clause to filter records to delete. Example:

```json
{
    "where": { "id": [1, 2] }
}
{
    "where": { "status": "draft" }
}
```
