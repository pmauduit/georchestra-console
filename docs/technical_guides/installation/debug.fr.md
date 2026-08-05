# Debug

## Logs applicatifs

En exécution via le service Debian, la Console cherche une configuration Logback externe dans cet ordre :

1. `${georchestra.datadir}/console/logback-spring.xml`
2. `${georchestra.datadir}/console/logback.xml`

Si aucun de ces fichiers n'existe, elle utilise la configuration embarquée dans `logback-spring.xml` du jar.

En développement, les logs sont affichés dans la console qui exécute :

```bash
./mvnw spring-boot:run
```

Pour obtenir plus de détails, ajoutez des niveaux de logs Spring Boot dans le datadir ou via les propriétés de démarrage, par exemple :

```properties
logging.level.org.georchestra.console=DEBUG
logging.level.org.springframework.security=DEBUG
```

Pour personnaliser complètement le format, les appenders ou les fichiers de sortie en production, créez plutôt un des fichiers Logback externes ci-dessus.

## Vérifier les services externes

### LDAP

Un problème LDAP se manifeste souvent par :

- une liste d'utilisateurs vide ;
- une erreur lors de la modification d'un compte ;
- une impossibilité de lire les organisations ou les rôles.

Vérifiez `ldapHost`, `ldapPort`, `ldapBaseDn`, `ldapAdminDn` et `ldapAdminPassword`.

### PostgreSQL

Un problème PostgreSQL peut empêcher :

- l'affichage des logs ;
- la gestion des délégations ;
- l'enregistrement des messages ;
- la gestion des tokens.

Vérifiez les paramètres `pgsql*` et l'existence du schéma `console`.

### SMTP

Si les mails ne partent pas, vérifiez :

- `smtpHost` ;
- `smtpPort` ;
- `from` et `replyTo` ;
- `administratorEmail` ;
- les modèles de mails personnalisés.

En développement, ouvrez Mailpit sur `http://localhost:8025`.

## Diagnostiquer les zones de compétence

Si le sélecteur de zones ne s'affiche pas ou reste vide :

1. Vérifiez que `competenceAreaEnabled=true`.
2. Ouvrez `/console/public/area.geojson`.
3. Vérifiez que le GeoJSON est une `FeatureCollection`.
4. Ouvrez `/console/public/orgs/areaConfig.json`.
5. Vérifiez que `AreasKey`, `AreasValue` et `AreasGroup` correspondent aux propriétés du GeoJSON.

## Tester les endpoints principaux

Avec une session authentifiée via le gateway, les endpoints utiles sont :

```text
/console/private/users/profile
/console/private/platform/infos
/console/public/users/requiredFields
/console/public/orgs/orgTypeValues
/console/internal/users
```

## Erreurs fréquentes

| Symptôme | Piste |
| --- | --- |
| Redirection ou accès refusé au manager | vérifier les rôles `SUPERUSER` ou `ORGADMIN` |
| Un administrateur ne voit aucun utilisateur | vérifier sa délégation |
| Les mails contiennent une mauvaise URL | vérifier `publicUrl` et `domainName` |
| Les modèles de mails localisés ne sont pas utilisés | vérifier le suffixe de langue et `templateEncoding` |
| La carte des zones ne charge rien | vérifier `AreasUrl` et le contenu GeoJSON |
