# Matrice des fonctionnalités

Cette matrice synthétise les fonctionnalités de la Console et leur mode d'accès.

| Fonctionnalité | Interface graphique | API | Configuration |
| --- | --- | --- | --- |
| Création de compte public | `/account/new` | formulaire serveur | `moderatedSignup`, `requiredFields`, `readonlyUid` |
| Validation de compte | Manager `Users` | `PUT /private/users/{uid}` | rôles et délégations |
| Modification de profil utilisateur | `/account/userdetails`, Manager `Users` | `PUT /private/users/{uid}` | `requiredFields`, `protectedUsersList` |
| Suppression de compte | Manager `Users`, RGPD utilisateur | `DELETE /private/users/{uid}`, `POST /account/gdpr/delete` | `gdpr.allowAccountDeletion` |
| Gestion des organisations | Manager `Orgs` | `/private/orgs` | `orgTypeValues`, `requiredFields` |
| Zones de compétence | Formulaires organisation | `/public/area.geojson`, `/public/orgs/areaConfig.json` | `competenceAreaEnabled`, `Areas*` |
| Gestion des rôles | Manager `Roles` | `/private/roles`, `/private/roles_users` | rôles LDAP |
| Délégations | Manager `Delegations` | `/private/delegation/*` | base PostgreSQL |
| Logs d'administration | Manager `Logs` | `/private/admin_logs/*` | base PostgreSQL |
| Changement d'e-mail | `/account/changeEmail` | formulaire serveur | SMTP, templates |
| Récupération de mot de passe | `/account/passwordRecovery` | formulaire serveur | SMTP, `delayInDays`, politique mot de passe |
| Modèles de mails | non | chargement fichiers | datadir `templates`, `subject.*`, `templateEncoding` |
| Email proxy | non | `POST /emailProxy` | `emailProxy*` |
| API internes sécurité | non | `/internal/*` | gateway, pré-authentification |

## Règles de couverture

Une fonctionnalité visible dans l'interface doit être documentée dans le guide utilisateur.

Une fonctionnalité pilotée par propriété, fichier, API ou service externe doit être documentée dans les guides techniques.

Quand une fonctionnalité combine les deux, par exemple les zones de compétence, le guide utilisateur explique l'usage et le guide technique explique la configuration.
