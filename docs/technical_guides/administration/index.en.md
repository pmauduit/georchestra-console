# Technical Administration

This section describes the technical elements required to operate the Console.

It does not replace the user guide: actions performed from the graphical interface are documented there. The purpose here is to understand the data being handled, the dependencies and the operational points of attention.

## Main Data

The Console handles several families of data:

- user accounts, stored in LDAP;
- organizations, stored in LDAP;
- roles and user/role associations, stored in LDAP;
- administration delegations, stored in PostgreSQL;
- administration logs, stored in PostgreSQL;
- messages, message templates and attachments, stored in PostgreSQL;
- password recovery or email change tokens, stored in PostgreSQL.

## Operational Responsibilities

The operator must maintain:

- LDAP connectivity;
- PostgreSQL connectivity;
- SMTP configuration;
- the geOrchestra datadir;
- custom mail templates;
- GeoJSON files used for competence areas;
- gateway or reverse proxy access rules.

## Points of Attention

- An LDAP error can prevent accounts, organizations and roles from being read or modified.
- A PostgreSQL error can prevent logs, delegations and messages from being displayed.
- Incorrect SMTP configuration can block account creation, email change or password recovery workflows.
- The pre-authentication header must provide at least the user identifier expected by the application.

![Technical administration illustration](images/gestion_donnees.jpg)
