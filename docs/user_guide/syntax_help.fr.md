# Règles fonctionnelles

Cette page résume les règles fonctionnelles à connaître avant de modifier des droits dans la Console.

## Modèle de droits

La Console manipule principalement trois objets :

- un **utilisateur**, identifié par un `uid` ;
- une **organisation**, qui représente le rattachement fonctionnel de l'utilisateur ;
- un **rôle**, qui ouvre des droits dans geOrchestra ou dans une application connectée.

Les rôles sont stockés dans le LDAP. Les applications geOrchestra consomment ensuite ces rôles pour autoriser ou refuser les actions.

## Rôles courants

Les rôles suivants ont une signification particulière :

- `SUPERUSER` : administration globale de la Console ;
- `ORGADMIN` : administration d'un périmètre délégué ;
- `USER` : utilisateur standard ;
- `PENDING` : compte en attente de validation ;
- `EXPIRED` : compte expiré ;
- `TEMPORARY` : rôle virtuel utilisé pour regrouper certains comptes temporaires ;
- `REFERENT` : rôle fonctionnel pouvant être utilisé pour identifier un référent.

Les rôles applicatifs peuvent être propres à chaque plateforme. Ils doivent rester explicites et documentés côté organisation.

## Délégations

Une délégation donne à un administrateur d'organisation le droit d'agir sur un périmètre précis.

Elle contient :

- des organisations administrables ;
- des rôles attribuables ou retirables.

Un administrateur délégué ne doit voir et modifier que les utilisateurs appartenant aux organisations déléguées, et seulement les rôles inclus dans la délégation.

## Organisations en attente

Quand la modération des inscriptions est activée, une demande de compte peut créer ou référencer une organisation en attente.

Un compte rattaché à une organisation en attente ne doit pas être validé avant validation de l'organisation.

## Comptes protégés

Certains comptes techniques peuvent être protégés contre la modification ou la suppression.

La liste est configurée techniquement avec `protectedUsersList`.

## Bonnes pratiques

- Créer des rôles applicatifs lisibles, en majuscules, par exemple `MAPSTORE_ADMIN`.
- Éviter de donner `SUPERUSER` pour un besoin limité à une organisation.
- Préférer une délégation `ORGADMIN` ciblée lorsqu'un administrateur ne doit gérer qu'un périmètre.
- Vérifier les logs après une action sensible.
- Documenter localement la signification des rôles spécifiques à la plateforme.

!!! warning "Action irréversible"
    Les suppressions de comptes, d'organisations ou de rôles peuvent avoir des effets immédiats sur les accès. Vérifiez le périmètre et les dépendances avant de supprimer.
