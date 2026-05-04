# Préparation

Avant de démarrer la Console, préparez les services externes et le datadir.

## Datadir

La configuration est chargée dans cet ordre :

1. `classpath:/console.yaml`
2. `${georchestra.datadir}/default.properties`
3. `${georchestra.datadir}/console/console.yaml`
4. `${georchestra.datadir}/console/console.properties`

Les fichiers du datadir permettent de surcharger les valeurs embarquées dans l'application.

En développement, un datadir d'exemple est fourni dans :

```bash
docker/dev/datadir
```

## Services Docker de développement

La stack de développement fournit :

- PostgreSQL sur le port `15432` ;
- LDAP sur le port `1389` ;
- SMTP Mailpit sur les ports `1025` et `8025` ;
- un nginx local pour le header ;
- le gateway geOrchestra sur le port `8080`.

## Variables importantes

Vérifiez au minimum :

- `pgsqlHost`, `pgsqlPort`, `pgsqlDatabase`, `pgsqlUser`, `pgsqlPassword` ;
- `ldapHost`, `ldapPort`, `ldapBaseDn`, `ldapAdminDn`, `ldapAdminPassword` ;
- `smtpHost`, `smtpPort` ;
- `domainName`, `publicUrl`, `publicContextPath` ;
- `administratorEmail`.

## Zones de compétence

Si `competenceAreaEnabled=true`, préparez aussi :

- un fichier GeoJSON local, par exemple `area.geojson` ;
- ou une URL distante retournant une `FeatureCollection` en EPSG:4326 ;
- les clés `AreasKey`, `AreasValue` et `AreasGroup`.
