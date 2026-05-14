# Documentation de l'API

Les URLs ci-dessous sont relatives au contexte applicatif `/console`.

La plupart des endpoints d'administration nécessitent une authentification geOrchestra et des droits adaptés. Les droits effectifs dépendent du rôle `SUPERUSER`, du rôle `ORGADMIN` et des délégations configurées.

## API publiques

| Méthode | URL | Description |
| --- | --- | --- |
| `GET` | `/public/users/requiredFields` | Champs requis pour la création d'utilisateur |
| `GET` | `/public/orgs/requiredFields` | Champs requis pour la création d'organisation |
| `GET` | `/public/orgs/orgTypeValues` | Valeurs possibles pour le type d'organisation |
| `GET` | `/public/orgs/areaConfig.json` | Métadonnées du sélecteur de zones |
| `GET` | `/public/area.geojson` | GeoJSON des zones de compétence |

Ces endpoints sont utilisés par les formulaires publics, notamment la création de compte.

## Utilisateurs

| Méthode | URL | Description |
| --- | --- | --- |
| `GET` | `/private/users` | Liste des utilisateurs visibles |
| `GET` | `/private/users/{uid}` | Détail d'un utilisateur |
| `GET` | `/private/users/profile` | Profil de l'utilisateur courant |
| `POST` | `/private/users` | Création d'un utilisateur |
| `PUT` | `/private/users/{uid}` | Modification partielle d'un utilisateur |
| `DELETE` | `/private/users/{uid}` | Suppression d'un utilisateur |
| `POST` | `/account/gdpr/delete` | Suppression du compte courant, si activée |

Exemple de création ou modification :

```json
{
  "uid": "jdupont",
  "givenName": "Jean",
  "sn": "Dupont",
  "mail": "jean.dupont@example.org",
  "telephoneNumber": "+33 1 00 00 00 00",
  "facsimileTelephoneNumber": "",
  "title": "Administrateur",
  "description": "Compte de test",
  "postalAddress": "1 rue Exemple",
  "org": "psc",
  "shadowExpire": "2026-12-31",
  "pending": false
}
```

Champs courants :

- `uid` ;
- `givenName` ;
- `sn` ;
- `mail` ;
- `telephoneNumber` ;
- `facsimileTelephoneNumber` ;
- `title` ;
- `description` ;
- `postalAddress` ;
- `manager` ;
- `knowledgeInformation` ou note selon le mapping LDAP ;
- `org` ;
- `shadowExpire` au format `yyyy-MM-dd` ;
- `pending`.

## Organisations

| Méthode | URL | Description |
| --- | --- | --- |
| `GET` | `/private/orgs` | Liste des organisations visibles |
| `GET` | `/private/orgs?logos=false` | Liste sans inclure les logos |
| `GET` | `/private/orgs/{cn}` | Détail d'une organisation |
| `GET` | `/private/orgs/uoi/{orgUniqueId}` | Recherche par identifiant d'organisation |
| `POST` | `/private/orgs` | Création d'une organisation |
| `PUT` | `/private/orgs/{commonName}` | Modification d'une organisation |
| `DELETE` | `/private/orgs/{commonName}` | Suppression d'une organisation |
| `GET` | `/private/orgsTypeDistribution.json` | Répartition des organisations par type |
| `GET` | `/private/orgsTypeDistribution.csv` | Même répartition au format CSV |

Exemple de payload :

```json
{
  "name": "Pôle données",
  "shortName": "PODO",
  "orgType": "Association",
  "address": "1 rue Exemple",
  "description": "Organisation de démonstration",
  "note": "Note interne",
  "url": "https://example.org",
  "mail": "contact@example.org",
  "orgUniqueId": "12345678900000",
  "cities": ["35000", "35238"],
  "pending": false
}
```

## Rôles

| Méthode | URL | Description |
| --- | --- | --- |
| `GET` | `/private/roles` | Liste des rôles visibles |
| `GET` | `/private/roles/{cn}` | Détail d'un rôle |
| `POST` | `/private/roles` | Création d'un rôle |
| `PUT` | `/private/roles/{cn}` | Modification d'un rôle |
| `DELETE` | `/private/roles/{cn}` | Suppression d'un rôle |
| `POST` | `/private/roles_users` | Ajout ou retrait de rôles à des utilisateurs |
| `POST` | `/private/roles_orgs` | Ajout ou retrait de rôles à des organisations |

Exemple de rôle :

```json
{
  "cn": "MAPSTORE_ADMIN",
  "description": "Administration MapStore",
  "isFavorite": true
}
```

Exemple d'affectation de rôles :

```json
{
  "users": ["jdupont"],
  "PUT": ["MAPSTORE_ADMIN"],
  "DELETE": ["OLD_ROLE"]
}
```

Pour les organisations :

```json
{
  "orgs": ["psc"],
  "PUT": ["ROLE_A"],
  "DELETE": ["ROLE_B"]
}
```

Le rôle `ORGADMIN` ne peut pas être ajouté ou retiré via `/private/roles_users`.

## Délégations

| Méthode | URL | Description |
| --- | --- | --- |
| `GET` | `/private/delegation/delegations` | Liste des délégations |
| `GET` | `/private/delegation/{uid}` | Délégation d'un utilisateur |
| `POST` | `/private/delegation/{uid}` | Création ou remplacement d'une délégation |
| `DELETE` | `/private/delegation/{uid}` | Suppression d'une délégation |

Exemple :

```json
{
  "orgs": ["psc", "demo"],
  "roles": ["USER", "MAPSTORE_ADMIN"]
}
```

Lors de la création d'une délégation, le rôle `ORGADMIN` est ajouté à l'utilisateur.

## Logs

| Méthode | URL | Description |
| --- | --- | --- |
| `GET` | `/private/admin_logs/{limit}/{page}` | Logs visibles, paginés |
| `GET` | `/private/admin_logs/{target}/{limit}/{page}` | Logs d'une cible |

Pour un administrateur délégué, les logs sont filtrés sur les utilisateurs de son périmètre.

## Informations plateforme

| Méthode | URL | Description |
| --- | --- | --- |
| `GET` | `/private/platform/infos` | Informations de configuration exposées au frontend |

La réponse inclut notamment :

- `saslEnabled` ;
- `analyticsEnabled` ;
- `extractorappEnabled` ;
- `competenceAreaEnabled` ;
- paramètres du header geOrchestra.

## Mails

| Méthode | URL | Description |
| --- | --- | --- |
| `GET` | `/{recipient}/emails` | Messages envoyés à un utilisateur |
| `POST` | `/{recipient}/sendEmail` | Envoi d'un message depuis l'interface |
| `GET` | `/attachments` | Liste des pièces jointes disponibles |
| `GET` | `/emailTemplates` | Liste des modèles stockés en base |
| `POST` | `/emailProxy` | Envoi de mail via l'email proxy |

Payload de l'email proxy :

```json
{
  "to": ["destinataire@example.org"],
  "cc": [],
  "bcc": [],
  "subject": "Sujet",
  "body": "Message"
}
```

Les limites de taille et de destinataires sont configurées avec `emailProxyMaxRecipient`, `emailProxyMaxBodySize` et `emailProxyMaxSubjectSize`.

## API internes geOrchestra

Les endpoints `/internal/*` exposent les objets du modèle de sécurité pour les autres composants geOrchestra.

| Méthode | URL | Description |
| --- | --- | --- |
| `GET` | `/internal/users` | Liste des utilisateurs |
| `GET` | `/internal/users/id/{id}` | Utilisateur par identifiant interne |
| `GET` | `/internal/users/username/{name}` | Utilisateur par nom de connexion |
| `GET` | `/internal/organizations` | Liste des organisations |
| `GET` | `/internal/organizations/id/{id}` | Organisation par identifiant |
| `GET` | `/internal/organizations/shortname/{name}` | Organisation par nom court |
| `GET` | `/internal/organizations/id/{id}/logo` | Logo de l'organisation |
| `GET` | `/internal/roles` | Liste des rôles |
| `GET` | `/internal/roles/name/{name}` | Rôle par nom |
| `POST` | `/internal/events/accountcreated` | Notification de création de compte OAuth2 |

Payload de l'événement OAuth2 :

```json
{
  "fullName": "Jean Dupont",
  "localUid": "jdupont",
  "email": "jean.dupont@example.org",
  "providerName": "example-oauth",
  "providerUid": "123456",
  "organization": "psc"
}
```

Cet événement déclenche une notification aux super-administrateurs et journalise la création du compte OAuth2.
