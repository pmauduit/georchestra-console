# Development

This section gathers information useful for integrating or evolving the Console.

![Development](images/developper.jpg)

## General Organization

The Console is a Spring Boot application.

The main layers are:

- `src/main/java/org/georchestra/console/ws`: web controllers and APIs;
- `src/main/java/org/georchestra/console/dao`: PostgreSQL data access;
- `src/main/java/org/georchestra/console/mailservice`: mail construction and sending;
- `src/main/resources/templates`: Thymeleaf views;
- `src/main/resources/static`: CSS and JavaScript;
- `src/main/resources/mail-templates`: embedded mail templates;
- `docs`: MkDocs documentation.

## Interface and API Separation

The manager interface uses Thymeleaf pages and some internal JSON calls from the browser.

The exposed APIs are split into three families:

- `/private/*`: administration endpoints used by the interface and authenticated integrations;
- `/public/*`: public endpoints for form configuration;
- `/internal/*`: internal geOrchestra APIs used by other components.

## Conventions

- Use `./mvnw` for Maven commands.
- Keep the application context `/console`.
- Use the objects and DAOs from the `georchestra-ldap-account-management` module to manipulate LDAP.
- Add targeted tests when a rights rule or endpoint is modified.
- Update the documentation when a screen, property or API changes.
