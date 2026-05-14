# Preparation

Before starting the Console, prepare the external services and the datadir.

## Datadir

Configuration is loaded in this order:

1. `classpath:/console.yaml`
2. `${georchestra.datadir}/default.properties`
3. `${georchestra.datadir}/console/console.yaml`
4. `${georchestra.datadir}/console/console.properties`

Files from the datadir override values embedded in the application.

In development, an example datadir is provided in:

```bash
docker/dev/datadir
```

## Development Docker Services

The development stack provides:

- PostgreSQL on port `15432`;
- LDAP on port `1389`;
- Mailpit SMTP on ports `1025` and `8025`;
- a local nginx for the header;
- the geOrchestra gateway on port `8080`.

## Important Variables

Check at least:

- `pgsqlHost`, `pgsqlPort`, `pgsqlDatabase`, `pgsqlUser`, `pgsqlPassword`;
- `ldapHost`, `ldapPort`, `ldapBaseDn`, `ldapAdminDn`, `ldapAdminPassword`;
- `smtpHost`, `smtpPort`;
- `domainName`, `publicUrl`, `publicContextPath`;
- `administratorEmail`.

## Competence Areas

If `competenceAreaEnabled=true`, also prepare:

- a local GeoJSON file, for example `area.geojson`;
- or a remote URL returning a `FeatureCollection` in EPSG:4326;
- the `AreasKey`, `AreasValue` and `AreasGroup` keys.
