# geOrchestra Console

`georchestra-console` is a Spring Boot rewrite of the geOrchestra Console webapp.

The project aims to replace the legacy console while keeping the same functional scope for user self-service, delegated administration, and platform administration.

## Scope

The application exposes three main functional areas:

- Public account workflows under `/console/account/*`
- User self-service under `/console/account/userdetails`
- Administration screens under `/console/manager/*`

The manager interface covers:

- Users
- Organizations
- Roles
- Delegations
- Administration logs
- User messaging

## Project Status

This project is an ongoing replacement of the historical geOrchestra console.

It is actively developed, but some areas are still under migration or stabilization. See [TECHNICAL_NOTES.md](TECHNICAL_NOTES.md) for project history, migration notes, and remaining work.

## Requirements

- Java 21
- Maven Wrapper (`./mvnw`)
- Docker and Docker Compose for the local development stack

## Quick Start

Start the local dependencies:

```bash
cd docker/dev
docker compose -f docker-compose-dev.yaml up -d
```

Run the application locally from the repository root:

```bash
./mvnw spring-boot:run \
  -Dspring-boot.run.jvmArguments="-Dgeorchestra.datadir=$(pwd)/docker/dev/datadir" \
  -Dspring-boot.run.arguments=--server.port=8081
```

Typical URLs:

- Direct access: `http://localhost:8081/console`
- Through the local gateway: `http://localhost:8080/console`

## Testing

Test execution is split between unit/slice tests and integration tests:

- `./mvnw test` runs fast tests through Surefire
- `./mvnw verify` runs fast tests and integration tests through Failsafe

Useful examples:

```bash
./mvnw test
./mvnw verify
./mvnw -Dtest=org.georchestra.console.boot.ConsoleApplicationTests test
./mvnw -Dit.test=org.georchestra.console.boot.AxeCoreAccessibilityIT verify
```

## Database Bootstrap

The project currently has no schema migration tool such as Flyway or Liquibase.

Some Console-specific PostgreSQL objects are not managed by JPA and must be created during the first installation with:

```bash
psql -f src/main/sql/console-bootstrap.sql
```

This script is not executed automatically by the application and is not packaged in the application jar.

## Documentation

Project documentation is maintained with MkDocs in [`docs`](docs).

Main entry points:

- User and operator docs: [`docs/index.en.md`](docs/index.en.md)
- Contribution and technical guides: [`docs/technical_guides/contribute/index.en.md`](docs/technical_guides/contribute/index.en.md)

Run the documentation locally:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r mkdocs_requirements.txt
mkdocs serve
```

Then open `http://127.0.0.1:8000/`.

## Repository Layout

- `src/main/java`: application code
- `src/main/resources/templates`: Thymeleaf views
- `src/main/resources/static`: static assets
- `src/test/java`: unit, slice, and integration tests
- `docker/dev`: local development stack
- `docs`: MkDocs documentation

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

Project discussions and coordination happen in the geOrchestra community channels and issue tracker.


## License

This project is distributed under the GNU GPL v3. See [LICENSE](LICENSE).
