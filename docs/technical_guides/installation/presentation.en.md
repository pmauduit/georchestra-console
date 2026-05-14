# Presentation

The Console is a Spring Boot application that progressively replaces the former geOrchestra console.

It provides:

- Thymeleaf pages for the user interface;
- JSON endpoints for administration;
- internal endpoints consumable by other geOrchestra components;
- mail services for account creation, password recovery and notifications.

## Component Architecture

The component relies on the following services:

- **LDAP**: stores users, organizations, roles and role associations;
- **PostgreSQL**: stores administration logs, delegations, messages, templates and tokens;
- **SMTP**: sends functional emails;
- **geOrchestra gateway**: routing, authentication and security header forwarding;
- **geOrchestra datadir**: local configuration and mail template overrides;
- **GeoJSON files**: optional competence area definitions.

The application is exposed under the `/console` context.

## Recommendation

In production, the Console should be exposed behind the gateway or a reverse proxy that provides geOrchestra pre-authentication headers.

In development, the repository provides a dedicated Docker stack to start LDAP, PostgreSQL, SMTP, the gateway and header resources. The Spring Boot application can then be launched locally with Java 21.
