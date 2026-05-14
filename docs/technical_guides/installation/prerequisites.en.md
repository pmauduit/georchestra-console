# Prerequisites

## Hardware

Requirements mostly depend on LDAP size and log volume.

For a local development environment, plan for at least:

- 2 CPUs;
- 5 GB of available memory;
- 10 GB of disk space for Docker images, the database and Maven dependencies.

## Software

To develop or run the Console locally:

- Java 21;
- Docker and Docker Compose;
- Git;
- the Maven Wrapper provided by the project: `./mvnw`.

The Maven Wrapper avoids requiring a global Maven installation. Documented Maven commands should therefore use `./mvnw`.

To run the documentation locally:

- Python 3;
- `pip`;
- the dependencies listed in `mkdocs_requirements.txt`.

## Required Services

The Console needs the following services:

- an LDAP server compatible with the geOrchestra model;
- a PostgreSQL database;
- an SMTP server;
- a gateway or reverse proxy forwarding security headers;
- a geOrchestra datadir containing configuration files.
