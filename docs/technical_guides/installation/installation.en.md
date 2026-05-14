# Installation

## Local Startup

From the `georchestra-console` module root, first start the Docker services:

```bash
cd docker/dev
docker compose -f docker-compose-dev.yaml up -d
```

Then return to the module root and start the Spring Boot application:

```bash
./mvnw spring-boot:run \
  -Dspring-boot.run.jvmArguments="-Dgeorchestra.datadir=$(pwd)/docker/dev/datadir" \
  -Dspring-boot.run.arguments=--server.port=8081
```

The application is then available:

- directly: `http://localhost:8081/console`
- through the gateway: `http://localhost:8080/console`

The administration interface is available at `/console/manager`.

## Local SMTP

In development, Mailpit is exposed on:

- SMTP: `localhost:1025`
- web interface: `http://localhost:8025`

Use this interface to check account creation, validation, password recovery or email change messages.

## Local Documentation

MkDocs documentation can be started with:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r mkdocs_requirements.txt
mkdocs serve
```

It is then available at `http://127.0.0.1:8000/`.

## Deployment

For a deployment integrated into geOrchestra, keep the following principles:

- expose the Console under `/console`;
- use the datadir for local configuration;
- place the application behind the gateway or a reverse proxy compatible with geOrchestra security headers;
- configure LDAP, PostgreSQL and SMTP with dedicated technical accounts;
- check that `publicUrl` matches the public URL used in mails.

## Debian Package and systemd Service

The Console can be built as a Debian package. This package installs the Spring Boot application, the systemd unit file and the Debian scripts required to reload systemd.

The package prepares a `georchestra-console.service` service. It starts the jar with the geOrchestra datadir:

```ini
ExecStart=/usr/bin/java -Dgeorchestra.datadir=/etc/georchestra -jar /srv/apps/georchestra-console/georchestra-console.jar
```

The service is intended to run with the `georchestra` system user. The package installation creates this user if it does not already exist.

After installation, the service can be enabled and started with systemd:

```bash
sudo systemctl enable georchestra-console.service
sudo systemctl start georchestra-console.service
```

This deployment mode is useful when the Console is operated as a standalone application behind the geOrchestra gateway or behind a reverse proxy, without an external Java application container.
