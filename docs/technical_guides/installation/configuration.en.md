# Configuration

The Console reads its configuration from embedded resources and then from the geOrchestra datadir.

## Loading Order

Sources are loaded in this order:

1. `classpath:/console.yaml`
2. `${georchestra.datadir}/default.properties`
3. `${georchestra.datadir}/console/console.yaml`
4. `${georchestra.datadir}/console/console.properties`

Datadir files therefore override the embedded configuration.

## External Connections

### PostgreSQL

```properties
pgsqlHost=localhost
pgsqlPort=15432
pgsqlDatabase=georchestra
pgsqlUser=georchestra
pgsqlPassword=georchestra
```

The Console uses PostgreSQL for administration logs, delegations, mails, templates, attachments and tokens.

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

LDAP contains accounts, organizations, roles and role associations.

### SMTP

```properties
smtpHost=localhost
smtpPort=1025
administratorEmail=psc@georchestra.org
```

SMTP is used for account workflows: creation, moderation, password recovery, email change and OAuth2 notifications.

## Public URLs and Header

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

`publicUrl` must match the public URL used in links sent by mail.

## Color Customization

The Console can reuse colors from an external stylesheet when the `georchestraStylesheet` property is set.

```properties
georchestraStylesheet=https://static.example.org/georchestra/stylesheet.css
```

This stylesheet is loaded before the Console internal style. It is also passed to the geOrchestra header component. If the property is empty or if the file is not available, the Console uses its default colors.

The stylesheet can define the following CSS variables:

```css
body {
  --georchestra-primary: #850774;
  --georchestra-secondary: rgb(137, 142, 153);
  --georchestra-primary-light: rgb(236, 216, 238);
  --georchestra-secondary-light: #dde1e2;
}
```

These variables notably customize:

- the main color of buttons, active links and action elements;
- the secondary color used for borders and some backgrounds;
- light variants used for page backgrounds, contrast areas and hover states;
- visual consistency between the Console and the geOrchestra header when the same file is used.

The `georchestraStylesheet` value can point to an absolute URL served by the portal, reverse proxy or a static server. In development, `docker/dev/nginx/html/stylesheet.css` provides a minimal example.

## Account Creation

Useful settings:

```properties
moderatedSignup=true
readonlyUid=false
requiredFields=firstName,surname,org,orgType
orgTypeValues=Association,Company,NGO,Individual,Other
```

- `moderatedSignup=true` places new accounts in the pending accounts unit.
- `readonlyUid=true` prevents users from choosing their identifier.
- `requiredFields` controls mandatory form fields.
- `orgTypeValues` populates the organization type list.

## Password Policy

```properties
password.minimumLength=8
password.requireLowers=false
password.requireUppers=false
password.requireDigits=false
password.requireSpecials=false
```

These settings are displayed in forms and applied when creating or changing a password.

## Agreements and Notices

```properties
privacy.policy.agreement.activated=false
privacy.policy.agreement.url=https://${domainName}/policy.html
data.processing.agreement.activated=false
data.processing.agreement.url=https://${domainName}/consent.html
```

These options add mandatory checkboxes to the account creation form.

## Competence Areas

```properties
competenceAreaEnabled=true
AreasUrl=area.geojson
AreasKey=INSEE_COM
AreasValue=NOM_COM
AreasGroup=INSEE_DEP
```

`AreasUrl` can be:

- a datadir file, for example `${georchestra.datadir}/console/area.geojson`;
- a relative path;
- an HTTP URL returning a GeoJSON.

The file must be a `FeatureCollection` in EPSG:4326.

Metadata is exposed through `/console/public/orgs/areaConfig.json`, and the GeoJSON through `/console/public/area.geojson`.

## reCAPTCHA

```properties
recaptcha.activated=false
verificationURL=https://www.google.com/recaptcha/api/siteverify
privateKey=...
publicKey=...
```

When enabled, reCAPTCHA protects public account creation and password recovery forms.

## GDPR

```properties
gdpr.allowAccountDeletion=true
gdpr.displayMembersList=false
pgsqlGNHost=localhost
pgsqlGNPort=5432
pgsqlGNDatabase=georchestra
pgsqlGNUser=georchestra
pgsqlGNPassword=georchestra
```

`gdpr.allowAccountDeletion` enables users to delete their own account from the user interface.

The `pgsqlGN*` settings are used for exporting or anonymizing data linked to GeoNetwork.

## SASL

```properties
saslEnabled=false
saslServer=
```

When `saslEnabled=true`, the interface can indicate that an account delegates authentication to an external system. Actual SASL server configuration remains outside the Console.

## Email Proxy

```properties
emailProxyFromAddress=${administratorEmail}
emailProxyMaxRecipient=10
emailProxyMaxBodySize=10000
emailProxyMaxSubjectSize=200
emailProxyRecipientWhitelist=${administratorEmail}
```

The `/console/emailProxy` endpoint allows sending mails through an API, with limits to prevent abuse.

## Mail Templates

Templates are resolved in this order:

1. `${georchestra.datadir}/console/templates/<template>`
2. embedded resources `classpath:/mail-templates/<template>`
3. legacy webapp templates if available

Resolution takes the current language into account. For `changeemail-email-template.txt` and the `fr` locale, the application first looks for:

```text
changeemail-email-template_fr.txt
changeemail-email-template.txt
```

The main files are:

| File | Usage |
| --- | --- |
| `newaccount-was-created-template.txt` | Account validated or created |
| `account-creation-in-progress-template.txt` | Pending account request |
| `newaccount-requires-moderation-template.txt` | Notification to moderators |
| `changepassword-email-template.txt` | Password recovery or change |
| `changepasswordoauth2-email-template.txt` | Password managed by an OAuth2 provider |
| `changeemail-email-template.txt` | Email address change |
| `account-uid-renamed.txt` | Identifier changed |
| `newaccount-notification-template.txt` | New account notification |
| `new-oauth2-account-notification-template.txt` | New OAuth2 account notification |

Variables available depending on templates:

- `{name}`;
- `{uid}`;
- `{email}`;
- `{org}`;
- `{url}`;
- `{providerName}`;
- `{providerUid}`;
- `{publicUrl}`;
- `{instanceName}`.

Mail subjects can be overridden with `subject.*` properties.

## Security and Pre-Authentication

The Console uses HTTP header pre-authentication.

The main expected header is:

```text
sec-username
```

In a geOrchestra environment, the gateway also provides information such as roles, email, first name and last name. These values are used by some endpoints, notably the email proxy.
