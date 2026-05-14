# Tests

## Automated Tests

The project follows the standard Maven layout:

- unit and slice tests in `src/test/java`;
- integration tests in `src/test/java`, named `*IT`;
- fixtures in `src/test/resources`.

Useful commands:

```bash
./mvnw test
./mvnw verify
./mvnw -Dtest=org.georchestra.console.boot.ConsoleApplicationTests test
./mvnw -Dit.test=org.georchestra.console.boot.AxeCoreAccessibilityIT verify
```

`./mvnw test` runs fast tests through Surefire.

`./mvnw verify` runs fast tests and integration tests through Failsafe.

## Manual Functional Checks

After installation, check at least:

1. opening `/console/manager` with a `SUPERUSER`;
2. displaying the user list;
3. displaying the organization list;
4. displaying the role list;
5. creating or updating a test user;
6. adding then removing an application role;
7. displaying administration logs;
8. sending a password recovery mail;
9. accessing `/console/internal/users` if internal APIs are exposed to the right scope.

## Documentation

To check the documentation:

```bash
mkdocs build --strict
```

In development, you can use:

```bash
mkdocs serve
```
