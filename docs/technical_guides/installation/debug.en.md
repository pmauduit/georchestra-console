# Debug

## Application Logs

The Console uses the Logback configuration embedded in `logback-spring.xml`.

In development, logs are displayed in the console running:

```bash
./mvnw spring-boot:run
```

To get more details, add Spring Boot log levels in the datadir or through startup properties, for example:

```properties
logging.level.org.georchestra.console=DEBUG
logging.level.org.springframework.security=DEBUG
```

## Check External Services

### LDAP

An LDAP issue often appears as:

- an empty user list;
- an error when updating an account;
- an inability to read organizations or roles.

Check `ldapHost`, `ldapPort`, `ldapBaseDn`, `ldapAdminDn` and `ldapAdminPassword`.

### PostgreSQL

A PostgreSQL issue can prevent:

- logs from being displayed;
- delegations from being managed;
- messages from being stored;
- tokens from being managed.

Check the `pgsql*` settings and the existence of the `console` schema.

### SMTP

If mails are not sent, check:

- `smtpHost`;
- `smtpPort`;
- `from` and `replyTo`;
- `administratorEmail`;
- custom mail templates.

In development, open Mailpit at `http://localhost:8025`.

## Diagnose Competence Areas

If the area selector is not displayed or remains empty:

1. Check that `competenceAreaEnabled=true`.
2. Open `/console/public/area.geojson`.
3. Check that the GeoJSON is a `FeatureCollection`.
4. Open `/console/public/orgs/areaConfig.json`.
5. Check that `AreasKey`, `AreasValue` and `AreasGroup` match the GeoJSON properties.

## Test Main Endpoints

With an authenticated session through the gateway, useful endpoints are:

```text
/console/private/users/profile
/console/private/platform/infos
/console/public/users/requiredFields
/console/public/orgs/orgTypeValues
/console/internal/users
```

## Common Errors

| Symptom | Hint |
| --- | --- |
| Redirect or access denied to the manager | check the `SUPERUSER` or `ORGADMIN` roles |
| An administrator sees no user | check their delegation |
| Mails contain the wrong URL | check `publicUrl` and `domainName` |
| Localized mail templates are not used | check the language suffix and `templateEncoding` |
| The area map loads nothing | check `AreasUrl` and the GeoJSON content |
