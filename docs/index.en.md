---
hide:
  - navigation
  - toc
---

# Home

## What is it?

The Console component is used to administer accounts, organizations, roles and administration delegations on a geOrchestra platform.

It is the functional entry point for managing access rights: a user belongs to an organization, receives application roles, and may eventually administer a delegated scope.

![User rights management](images/illustration_droits_utilisateurs.png)

## Scope

The documentation is organized into two parts:

- the **user guide**, intended for functional administrators using the graphical interface;
- the **technical guides**, intended for operators and developers who configure the application, mail templates, endpoints or integrations.

From the graphical interface, an administrator can notably:

- browse and filter users;
- create or validate accounts;
- update account information;
- assign or remove roles;
- manage organizations;
- consult administration logs to trace changes;
- consult messages sent to users and trigger mail sending when this feature is enabled in the configuration;
- check delegations granted to organization administrators.

Technical configuration, such as LDAP, PostgreSQL, SMTP, password rules, mail templates or internal APIs, is documented in the technical guides.

## Multilingual Support

The application is natively available in French, English, German, Spanish and Dutch.

## Quick Access

The Console application is available once authenticated under the `/console` context.

In local development, the application is usually available:

- directly: `http://localhost:8081/console`
- through the geOrchestra gateway: `http://localhost:8080/console`

In a deployed environment, add `/console` to your domain name to access it.

Example: `https://demo.georchestra.org/console`

The functional administration area is located in `Console > Manager`, or directly at `/console/manager`.
