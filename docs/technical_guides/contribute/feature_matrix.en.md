# Feature Matrix

This matrix summarizes Console features and how they are accessed.

| Feature | Graphical Interface | API | Configuration |
| --- | --- | --- | --- |
| Public account creation | `/account/new` | server-side form | `moderatedSignup`, `requiredFields`, `readonlyUid` |
| Account validation | Manager `Users` | `PUT /private/users/{uid}` | roles and delegations |
| User profile update | `/account/userdetails`, Manager `Users` | `PUT /private/users/{uid}` | `requiredFields`, `protectedUsersList` |
| Account deletion | Manager `Users`, user GDPR | `DELETE /private/users/{uid}`, `POST /account/gdpr/delete` | `gdpr.allowAccountDeletion` |
| Organization management | Manager `Orgs` | `/private/orgs` | `orgTypeValues`, `requiredFields` |
| Competence areas | Organization forms | `/public/area.geojson`, `/public/orgs/areaConfig.json` | `competenceAreaEnabled`, `Areas*` |
| Role management | Manager `Roles` | `/private/roles`, `/private/roles_users` | LDAP roles |
| Delegations | Manager `Delegations` | `/private/delegation/*` | PostgreSQL database |
| Administration logs | Manager `Logs` | `/private/admin_logs/*` | PostgreSQL database |
| Email change | `/account/changeEmail` | server-side form | SMTP, templates |
| Password recovery | `/account/passwordRecovery` | server-side form | SMTP, `delayInDays`, password policy |
| Mail templates | no | file loading | datadir `templates`, `subject.*`, `templateEncoding` |
| Email proxy | no | `POST /emailProxy` | `emailProxy*` |
| Internal security APIs | no | `/internal/*` | gateway, pre-authentication |

## Coverage Rules

A feature visible in the interface must be documented in the user guide.

A feature driven by a property, file, API or external service must be documented in the technical guides.

When a feature combines both, for example competence areas, the user guide explains how to use it and the technical guide explains how to configure it.
