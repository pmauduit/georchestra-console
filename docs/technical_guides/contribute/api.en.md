# API Documentation

The URLs below are relative to the `/console` application context.

Most administration endpoints require geOrchestra authentication and suitable rights. Effective rights depend on the `SUPERUSER` role, the `ORGADMIN` role and configured delegations.

## Public APIs

| Method | URL | Description |
| --- | --- | --- |
| `GET` | `/public/users/requiredFields` | Required fields for user creation |
| `GET` | `/public/orgs/requiredFields` | Required fields for organization creation |
| `GET` | `/public/orgs/orgTypeValues` | Possible organization type values |
| `GET` | `/public/orgs/areaConfig.json` | Area selector metadata |
| `GET` | `/public/area.geojson` | Competence area GeoJSON |

These endpoints are used by public forms, especially account creation.

## Users

| Method | URL | Description |
| --- | --- | --- |
| `GET` | `/private/users` | List of visible users |
| `GET` | `/private/users/{uid}` | User details |
| `GET` | `/private/users/profile` | Current user profile |
| `POST` | `/private/users` | Create a user |
| `PUT` | `/private/users/{uid}` | Partially update a user |
| `DELETE` | `/private/users/{uid}` | Delete a user |
| `POST` | `/account/gdpr/delete` | Delete the current account, if enabled |

Creation or update example:

```json
{
  "uid": "jdupont",
  "givenName": "Jean",
  "sn": "Dupont",
  "mail": "jean.dupont@example.org",
  "telephoneNumber": "+33 1 00 00 00 00",
  "facsimileTelephoneNumber": "",
  "title": "Administrator",
  "description": "Test account",
  "postalAddress": "1 Example Street",
  "org": "psc",
  "shadowExpire": "2026-12-31",
  "pending": false
}
```

Common fields:

- `uid`;
- `givenName`;
- `sn`;
- `mail`;
- `telephoneNumber`;
- `facsimileTelephoneNumber`;
- `title`;
- `description`;
- `postalAddress`;
- `manager`;
- `knowledgeInformation` or note depending on the LDAP mapping;
- `org`;
- `shadowExpire` in `yyyy-MM-dd` format;
- `pending`.

## Organizations

| Method | URL | Description |
| --- | --- | --- |
| `GET` | `/private/orgs` | List of visible organizations |
| `GET` | `/private/orgs?logos=false` | List without including logos |
| `GET` | `/private/orgs/{cn}` | Organization details |
| `GET` | `/private/orgs/uoi/{orgUniqueId}` | Lookup by organization identifier |
| `POST` | `/private/orgs` | Create an organization |
| `PUT` | `/private/orgs/{commonName}` | Update an organization |
| `DELETE` | `/private/orgs/{commonName}` | Delete an organization |
| `GET` | `/private/orgsTypeDistribution.json` | Organization distribution by type |
| `GET` | `/private/orgsTypeDistribution.csv` | Same distribution in CSV format |

Payload example:

```json
{
  "name": "Data Office",
  "shortName": "DATA",
  "orgType": "Association",
  "address": "1 Example Street",
  "description": "Demo organization",
  "note": "Internal note",
  "url": "https://example.org",
  "mail": "contact@example.org",
  "orgUniqueId": "12345678900000",
  "cities": ["35000", "35238"],
  "pending": false
}
```

## Roles

| Method | URL | Description |
| --- | --- | --- |
| `GET` | `/private/roles` | List of visible roles |
| `GET` | `/private/roles/{cn}` | Role details |
| `POST` | `/private/roles` | Create a role |
| `PUT` | `/private/roles/{cn}` | Update a role |
| `DELETE` | `/private/roles/{cn}` | Delete a role |
| `POST` | `/private/roles_users` | Add or remove roles from users |
| `POST` | `/private/roles_orgs` | Add or remove roles from organizations |

Role example:

```json
{
  "cn": "MAPSTORE_ADMIN",
  "description": "MapStore administration",
  "isFavorite": true
}
```

Role assignment example:

```json
{
  "users": ["jdupont"],
  "PUT": ["MAPSTORE_ADMIN"],
  "DELETE": ["OLD_ROLE"]
}
```

For organizations:

```json
{
  "orgs": ["psc"],
  "PUT": ["ROLE_A"],
  "DELETE": ["ROLE_B"]
}
```

The `ORGADMIN` role cannot be added or removed through `/private/roles_users`.

## Delegations

| Method | URL | Description |
| --- | --- | --- |
| `GET` | `/private/delegation/delegations` | List delegations |
| `GET` | `/private/delegation/{uid}` | User delegation |
| `POST` | `/private/delegation/{uid}` | Create or replace a delegation |
| `DELETE` | `/private/delegation/{uid}` | Delete a delegation |

Example:

```json
{
  "orgs": ["psc", "demo"],
  "roles": ["USER", "MAPSTORE_ADMIN"]
}
```

When a delegation is created, the `ORGADMIN` role is added to the user.

## Logs

| Method | URL | Description |
| --- | --- | --- |
| `GET` | `/private/admin_logs/{limit}/{page}` | Visible logs, paginated |
| `GET` | `/private/admin_logs/{target}/{limit}/{page}` | Logs for one target |

For a delegated administrator, logs are filtered to users within their scope.

## Platform Information

| Method | URL | Description |
| --- | --- | --- |
| `GET` | `/private/platform/infos` | Configuration information exposed to the frontend |

The response includes notably:

- `saslEnabled`;
- `analyticsEnabled`;
- `extractorappEnabled`;
- `competenceAreaEnabled`;
- geOrchestra header settings.

## Mails

| Method | URL | Description |
| --- | --- | --- |
| `GET` | `/{recipient}/emails` | Messages sent to a user |
| `POST` | `/{recipient}/sendEmail` | Send a message from the interface |
| `GET` | `/attachments` | List available attachments |
| `GET` | `/emailTemplates` | List templates stored in the database |
| `POST` | `/emailProxy` | Send mail through the email proxy |

Email proxy payload:

```json
{
  "to": ["recipient@example.org"],
  "cc": [],
  "bcc": [],
  "subject": "Subject",
  "body": "Message"
}
```

Recipient and size limits are configured with `emailProxyMaxRecipient`, `emailProxyMaxBodySize` and `emailProxyMaxSubjectSize`.

## Internal geOrchestra APIs

The `/internal/*` endpoints expose security model objects for other geOrchestra components.

| Method | URL | Description |
| --- | --- | --- |
| `GET` | `/internal/users` | List users |
| `GET` | `/internal/users/id/{id}` | User by internal identifier |
| `GET` | `/internal/users/username/{name}` | User by login name |
| `GET` | `/internal/organizations` | List organizations |
| `GET` | `/internal/organizations/id/{id}` | Organization by identifier |
| `GET` | `/internal/organizations/shortname/{name}` | Organization by short name |
| `GET` | `/internal/organizations/id/{id}/logo` | Organization logo |
| `GET` | `/internal/roles` | List roles |
| `GET` | `/internal/roles/name/{name}` | Role by name |
| `POST` | `/internal/events/accountcreated` | OAuth2 account creation notification |

OAuth2 event payload:

```json
{
  "fullName": "Jean Dupont",
  "localUid": "jdupont",
  "email": "jean.dupont@example.org",
  "providerName": "example-oauth",
  "providerUid": "123456",
  "organization": "psc"
}
```

This event sends a notification to super administrators and logs the OAuth2 account creation.
