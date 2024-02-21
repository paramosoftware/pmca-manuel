## Endpoints

The API has the following endpoints:

``` 
    GET /api/:model - Get many
    GET /api/:model/:id - Get one
    GET /api/:model/export - Export with query

    PUT /api/:model - Update all
    PUT /api/:model/:id - Update one

    POST /api/:model - Create one or many
    POST /api/:model/query - Get one or many with query
    POST /api/:model/:id/query - Get one with query
    POST /api/:model/:id/upload - Upload media
    POST /api/:model/import - Import all

    DELETE /api/:model/:id - Delete one
    DELETE /api/:model/query - Delete one or many with query
```





## Some rules

- The `<field>Id` has precedence over the `<field>` when both are present in the request body. For example, if both `author` and `authorId` are present in the request body, the API will use the `authorId` field to associate the record with the `Author` record, and ignore the `author` field. Otherwise, the API will use the `author` field to associate the record with the `Author` record.



## Working with related data

When creating or updating a record, you can also create or update related records. For example, when creating a new `Entry` record, you can also create a new `Reference` record for that `Entry` record. The API has some default behavior for handling related records, but you can also customize this behavior using the `_action_` attribute in the request body.

The available actions are:

- `create`: Create a new related record.
- `update`: Update an existing related record.
- `connect`: Connect an existing related record.


### Default behavior

When creating or updating a record, you can include related records in the request body. The API will automatically create or update the related records based on the request body. For example, when creating a new `Entry` record, you can include a `Reference` record in the request body. The API will automatically create the `Reference` record and associate it with the new `Entry` record. If the `id` field is included in the `Reference` record, the API will connect the `Reference` record to the `Entry` record using the `id` field. If the `id` field is not included in the `Reference` record, the API will create a new `Reference` record and associate it with the new `Entry` record. The same behavior applies when updating a record. 

If you want to update a related record, then  you can use the `_action_` attribute in the request body to specify the action to perform. For example, if you want to update a `Reference` record when creating a new `Entry` record, you can include the `_action_` attribute in the request body with the value `update`. The API will then update the `Reference` record based on the request body.

Example:

```json
{
  "title": "New entry",
  "reference": {
    "title": "New reference",
    "_action_": "update"
  }
}
```


### Limitations

Related records are limited to one level of nesting. For example, you can create or update a `Reference` record when creating or updating an `Entry` record, but you cannot create a related `Reference` record when creating or updating a related `Entry` record. If you need to create or update related records beyond one level of nesting, you can use the `connect` action to connect an existing related record.