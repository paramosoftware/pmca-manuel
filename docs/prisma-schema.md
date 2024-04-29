# Prisma Schema

This schema is main source of truth for the app.
It is used to generate the Prisma schema and seed the configuration of forms and fields.
As such, it is extended with Prisma recognized comments (starting with ///) to provide additional information for the seed script.
These configuration can be changed in the admin interface (not fully implemented).

## Conventions

Any @unique field can be used as id for the model (normally called identifier throughout the app to avoid confusion with the id field).

### Hierarchal models

In hierarchal models (like Category), the following fields are required:

-   `parentId: Int?` (the id of the parent category)
-   `children: Category[] @relation("CategoryToChildren")` (the children categories)
-   `parent: Category? @relation("CategoryToChildren", fields: [parentId], references: [id])` (the parent category)

This allows the app to know that the model is hierarchal.

### Generated fields

The following fields are always generated and don't need to be sent in the form:

-   `id: Int @id @default(autoincrement())`
-   `createdAt: DateTime? @default(now())`
-   `updatedAt: DateTime? @updatedAt`
-   `[prefix]Normalized: String?` (normalized version of the field)
-   `[prefix]Slug: String?` (slug version of the field)

Prefix is the name of the field to which the generated field is related. For example, the normalized version of the field `name` is `nameNormalized` or `title` is `titleNormalized`.

### Resource models

The following conventions are used for Resource models:

-   The name of the model is the name of the resource.
-   Models starting with another resource name are considered relations (`isRelation = true`). Example: [Resource]Field is a relation of [Resource]. Example: ConceptField is a relation of Concept.
-   Relations inherit the following configuration of the parent model: `isPublic` and `isAppModel`.

### Models

The following conventions are used for models:

-   In one-to-one or one-to-many relations, in the one side of the relation, the scalar field should be the same as the relation field but with the suffix "Id". Example: `userId Int?` and `user User @relation(fields: [userId], references: [id])`.

-   The relation name given by Prisma to relations is used and should not be changed: [ModelName] + 'To' + [RelatedModelName]. Example: `UserToGroup`.

-   The `name` field is the main label of the object and when possible should be in the model schema.
-   All text fields, that need to be searchable, should have a normalized version of the field, with the suffix "Normalized". Example: `nameNormalized String?`
-   Slugs can be used to generate urls for the object and should be unique.
-   All rich text fields should have a Rich version of the field, with the suffix "Rich". Example: `descriptionRich String?`

### Form generation

The Prisma schema is used to generate the configuration of forms and fields in the seed script (prisma/seed/basis.ts).

The following conventions for the generated form:

-   The order of the fields in the model is the position in which they will be displayed in the form (`position = index`).
-   Generated fields (listed above) are not displayed in the form (`disabled = true` and `hidden = true`).
-   Fields with a name ending in "Id" are displayed as a select field and their counterpart is hidden.
-   Lists are displayed as an autocomplete field.
-   Description, definition and notes fields are displayed as textareas.
-   Relation fields which model is a relation of the current model are displayed as a auxiliary form field. Example: `variations ConceptVariation[]`

### Comments syntax

Comments syntax for models: key:value|key:value|... The keys are any of the fields of the `Resource` model.
Comments syntax for fields: key:value|key:value|... The keys are any of the fields of the `ResourceField` model.

### Workarounds

-   The following query, which filters the related model, only works when the relation is optional (specifically, `language` and `languageId` in `ConceptTranslation` model).
    When the relation is required, the where clause is not generated in the types

```prisma
        include: {
           translations: {
               include: {
                   language: {
                       where: {
                           published: true
                       }
                   }
               }
           },
       },
```

So if the relation is required, it should be changed to optional in the Prisma schema, but the field should be required in the form with `required:true` in the comments.
