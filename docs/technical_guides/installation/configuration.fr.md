# Configuration

La Console lit sa configuration depuis les ressources embarquées puis depuis le datadir geOrchestra.

## Ordre de chargement

Les sources sont chargées dans cet ordre :

1. `classpath:/console.yaml`
2. `${georchestra.datadir}/default.properties`
3. `${georchestra.datadir}/console/console.yaml`
4. `${georchestra.datadir}/console/console.properties`

Les fichiers du datadir surchargent donc la configuration embarquée.

## Connexions externes

### PostgreSQL

```properties
pgsqlHost=localhost
pgsqlPort=15432
pgsqlDatabase=georchestra
pgsqlUser=georchestra
pgsqlPassword=georchestra
```

La Console utilise PostgreSQL pour les logs d'administration, les délégations, les mails, les modèles, les pièces jointes et les tokens.

### LDAP

```properties
ldapScheme=ldap
ldapHost=localhost
ldapPort=1389
ldapBaseDn=dc=georchestra,dc=org
ldapAdminDn=cn=admin,dc=georchestra,dc=org
ldapAdminPassword=secret
ldapUsersRdn=ou=users
ldapRolesRdn=ou=roles
ldapOrgsRdn=ou=orgs
```

Le LDAP contient les comptes, organisations, rôles et associations de rôles.

### SMTP

```properties
smtpHost=localhost
smtpPort=1025
administratorEmail=psc@georchestra.org
```

Le SMTP est utilisé pour les workflows de compte : création, modération, récupération de mot de passe, changement d'e-mail et notifications OAuth2.

## URL publiques et header

```properties
domainName=localhost:8080
publicUrl=http://localhost:8080
publicContextPath=/console
useLegacyHeader=false
headerUrl=/header/
headerHeight=90
headerScript=http://localhost:8090/_header.js
georchestraStylesheet=http://localhost:8090/stylesheet.css
headerConfigFile=http://localhost:8090/header_config.json
logoUrl=https://www.georchestra.org/public/georchestra-logo.svg
```

`publicUrl` doit correspondre à l'URL publique utilisée dans les liens envoyés par mail.

## Personnalisation des couleurs

La Console peut reprendre les couleurs d'une feuille de style externe si la propriété `georchestraStylesheet` est renseignée.

```properties
georchestraStylesheet=https://static.example.org/georchestra/stylesheet.css
```

Cette feuille est chargée avant le style interne de la Console. Elle est également transmise au composant d'en-tête geOrchestra. Si la propriété est vide ou si le fichier n'est pas disponible, la Console utilise ses couleurs par défaut.

Le fichier de style peut définir les variables CSS suivantes :

```css
body {
  --georchestra-primary: #850774;
  --georchestra-secondary: rgb(137, 142, 153);
  --georchestra-primary-light: rgb(236, 216, 238);
  --georchestra-secondary-light: #dde1e2;
}
```

Ces variables permettent notamment de personnaliser :

- la couleur principale des boutons, liens actifs et éléments d'action ;
- la couleur secondaire utilisée pour les bordures et certains fonds ;
- les variantes claires utilisées pour les fonds de page, les zones de contraste et les états survolés ;
- la cohérence visuelle entre la Console et le header geOrchestra lorsque le même fichier est utilisé.

La valeur de `georchestraStylesheet` peut pointer vers une URL absolue servie par le portail, le reverse proxy ou un serveur statique. En développement, le fichier `docker/dev/nginx/html/stylesheet.css` donne un exemple minimal.

## Création de compte

Paramètres utiles :

```properties
moderatedSignup=true
readonlyUid=false
requiredFields=firstName,surname,org,orgType
orgTypeValues=Association,Company,NGO,Individual,Other
```

- `moderatedSignup=true` place les nouveaux comptes dans l'unité des comptes en attente.
- `readonlyUid=true` empêche l'utilisateur de choisir son identifiant.
- `requiredFields` pilote les champs obligatoires des formulaires.
- `orgTypeValues` alimente la liste des types d'organisation.

## Politique de mot de passe

```properties
password.minimumLength=8
password.requireLowers=false
password.requireUppers=false
password.requireDigits=false
password.requireSpecials=false
```

Ces paramètres sont affichés dans les formulaires et appliqués lors de la création ou modification du mot de passe.

## Accords et mentions

```properties
privacy.policy.agreement.activated=false
privacy.policy.agreement.url=https://${domainName}/policy.html
data.processing.agreement.activated=false
data.processing.agreement.url=https://${domainName}/consent.html
```

Ces options ajoutent des cases à cocher obligatoires dans le formulaire de création de compte.

## Zones de compétence

```properties
competenceAreaEnabled=true
AreasUrl=area.geojson
AreasKey=INSEE_COM
AreasValue=NOM_COM
AreasGroup=INSEE_DEP
```

`AreasUrl` peut être :

- un fichier du datadir, par exemple `${georchestra.datadir}/console/area.geojson` ;
- un chemin relatif ;
- une URL HTTP retournant un GeoJSON.

Le fichier doit être une `FeatureCollection` en EPSG:4326.

Les métadonnées sont exposées via `/console/public/orgs/areaConfig.json`, et le GeoJSON via `/console/public/area.geojson`.

## reCAPTCHA

```properties
recaptcha.activated=false
verificationURL=https://www.google.com/recaptcha/api/siteverify
privateKey=...
publicKey=...
```

Quand il est activé, le reCAPTCHA protège les formulaires publics de création de compte et de récupération de mot de passe.

## RGPD

```properties
gdpr.allowAccountDeletion=true
gdpr.displayMembersList=false
pgsqlGNHost=localhost
pgsqlGNPort=5432
pgsqlGNDatabase=georchestra
pgsqlGNUser=georchestra
pgsqlGNPassword=georchestra
```

`gdpr.allowAccountDeletion` active la suppression de son propre compte depuis l'interface utilisateur.

Les paramètres `pgsqlGN*` sont utilisés pour l'export ou l'anonymisation de données liées à GeoNetwork.

## SASL

```properties
saslEnabled=false
saslServer=
```

Quand `saslEnabled=true`, l'interface peut indiquer qu'un compte délègue son authentification à un système externe. La configuration réelle du serveur SASL reste hors de la Console.

## Email proxy

```properties
emailProxyFromAddress=${administratorEmail}
emailProxyMaxRecipient=10
emailProxyMaxBodySize=10000
emailProxyMaxSubjectSize=200
emailProxyRecipientWhitelist=${administratorEmail}
```

L'endpoint `/console/emailProxy` permet l'envoi de mails par API, avec des limites pour éviter les abus.

## Modèles de mails

Les modèles sont résolus dans cet ordre :

1. `${georchestra.datadir}/console/templates/<template>`
2. les ressources embarquées `classpath:/mail-templates/<template>`
3. les anciens templates webapp si disponibles

La résolution tient compte de la langue courante. Pour `changeemail-email-template.txt` et la locale `fr`, l'application cherche d'abord :

```text
changeemail-email-template_fr.txt
changeemail-email-template.txt
```

Les principaux fichiers sont :

| Fichier | Usage |
| --- | --- |
| `newaccount-was-created-template.txt` | Compte validé ou créé |
| `account-creation-in-progress-template.txt` | Demande de compte en attente |
| `newaccount-requires-moderation-template.txt` | Notification aux modérateurs |
| `changepassword-email-template.txt` | Récupération ou changement de mot de passe |
| `changepasswordoauth2-email-template.txt` | Mot de passe géré par un fournisseur OAuth2 |
| `changeemail-email-template.txt` | Changement d'adresse e-mail |
| `account-uid-renamed.txt` | Identifiant modifié |
| `newaccount-notification-template.txt` | Notification de nouveau compte |
| `new-oauth2-account-notification-template.txt` | Notification de nouveau compte OAuth2 |

Variables disponibles selon les templates :

- `{name}` ;
- `{uid}` ;
- `{email}` ;
- `{org}` ;
- `{url}` ;
- `{providerName}` ;
- `{providerUid}` ;
- `{publicUrl}` ;
- `{instanceName}`.

Les objets des mails peuvent être surchargés avec les propriétés `subject.*`.

## Sécurité et pré-authentification

La Console utilise une pré-authentification par en-tête HTTP.

L'en-tête principal attendu est :

```text
sec-username
```

En environnement geOrchestra, le gateway fournit aussi des informations comme les rôles, l'e-mail, le prénom et le nom. Ces valeurs sont utilisées par certains endpoints, notamment l'email proxy.
