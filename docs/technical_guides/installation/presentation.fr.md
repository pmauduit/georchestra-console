# Présentation

La Console est une application Spring Boot qui remplace progressivement l'ancienne console geOrchestra.

Elle fournit :

- des pages Thymeleaf pour l'interface utilisateur ;
- des endpoints JSON pour l'administration ;
- des endpoints internes consommables par d'autres composants geOrchestra ;
- des services de mail pour la création de compte, la récupération de mot de passe et les notifications.

## Architecture composant

Le composant s'appuie sur les services suivants :

- **LDAP** : stockage des utilisateurs, organisations, rôles et associations de rôles ;
- **PostgreSQL** : stockage des logs d'administration, délégations, messages, modèles et tokens ;
- **SMTP** : envoi des mails fonctionnels ;
- **gateway geOrchestra** : routage, authentification et transmission des en-têtes de sécurité ;
- **datadir geOrchestra** : configuration locale et surcharge des modèles de mails ;
- **fichiers GeoJSON** : définition optionnelle des zones de compétence.

L'application est exposée sous le contexte `/console`.

## Recommandation

En production, la Console doit être exposée derrière le gateway ou un reverse proxy qui fournit les en-têtes de pré-authentification geOrchestra.

En développement, le dépôt fournit une stack Docker dédiée pour démarrer LDAP, PostgreSQL, SMTP, le gateway et les ressources de header. L'application Spring Boot peut ensuite être lancée localement avec Java 21.
