# Contributing

Thanks for contributing to `georchestra-console`.

This project is part of the geOrchestra ecosystem and is developed in the open. Contributions are welcome for bug fixes, tests, documentation, accessibility, packaging, and feature improvements.

## Before You Start

- Search existing issues and pull requests before starting work
- Open an issue before large changes or new features
- Keep changes scoped and easy to review

## Development Setup

Prerequisites:

- Java 21
- Docker and Docker Compose
- Python 3 if you also work on the MkDocs documentation

Start the local stack:

```bash
cd docker/dev
docker compose -f docker-compose-dev.yaml up -d
```

Run the application:

```bash
./mvnw spring-boot:run \
  -Dspring-boot.run.jvmArguments="-Dgeorchestra.datadir=$(pwd)/docker/dev/datadir" \
  -Dspring-boot.run.arguments=--server.port=8081
```

Common entry points:

- App through gateway: `http://localhost:8080/console`
- App directly: `http://localhost:8081/console`

## Testing

Run tests before opening a pull request.

- Fast tests:

```bash
./mvnw test
```

- Full verification:

```bash
./mvnw verify
```

Targeted examples:

```bash
./mvnw -Dtest=org.georchestra.console.boot.ConsoleApplicationTests test
./mvnw -Dit.test=org.georchestra.console.boot.AxeCoreAccessibilityIT verify
```

## Code Conventions

General expectations:

- Prefer small, reviewable pull requests
- Add or update tests when behavior changes
- Update documentation when a screen, property, API, or workflow changes
- Do not mix unrelated fixes in the same pull request

Project-specific conventions:

- Use `./mvnw` rather than a system Maven when possible
- Keep the application context path `/console`
- Preserve compatibility with the current geOrchestra snapshot targeted by the project
- Keep GeoTools dependencies aligned as a set

Formatting:

- Java code in this repository historically follows tab-based indentation
- Avoid trailing whitespace
- Keep HTML, CSS, and YAML changes readable and consistent with the surrounding file

## Pull Requests

Please follow these rules:

- One pull request should address one feature, fix, or refactoring topic
- Explain the user-visible impact and any migration impact
- Mention related issues when relevant
- Include documentation updates when deployment, configuration, or behavior changes

Recommended PR title format:

```text
console - short description
```

## Documentation

Documentation lives in [`docs`](docs) and is built with MkDocs.

To preview documentation locally:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r mkdocs_requirements.txt
mkdocs serve
```

## License

By contributing to this repository, you agree that your contribution is submitted under the terms of the GNU GPL v3 license used by this project.
