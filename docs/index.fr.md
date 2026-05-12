---
hide:
  - navigation
  - toc
---

# Accueil

## C'est quoi ?

Le composant Console permet d'administrer les comptes, les organisations, les rôles et les délégations d'administration d'une plateforme geOrchestra.

Il est le point d'entrée fonctionnel pour gérer les droits d'accès : un utilisateur appartient à une organisation, reçoit des rôles applicatifs, et peut éventuellement administrer un périmètre délégué.

![Gestion des droits utilisateurs](images/illustration_droits_utilisateurs.png)

## Périmètre

La documentation est organisée en deux parties :

- le **guide utilisateur**, destiné aux administrateurs fonctionnels qui utilisent l'interface graphique ;
- les **guides techniques**, destinés aux exploitants et développeurs qui configurent l'application, les modèles de mails, les endpoints ou les intégrations.

Depuis l'interface graphique, un administrateur peut notamment :

- parcourir et filtrer les utilisateurs ;
- créer ou valider des comptes ;
- modifier les informations d'un compte ;
- affecter ou retirer des rôles ;
- gérer les organisations ;
- consulter les journaux d'administration afin de tracer les changements effectués ;
- consulter les messages envoyés aux utilisateurs et déclencher l'envoi de mails lorsque cette fonctionnalité est activée dans la configuration ;
- vérifier les délégations accordées à des administrateurs d'organisation.

La configuration technique, comme les paramètres LDAP, PostgreSQL, SMTP, les règles de mot de passe, les modèles de mails ou les API internes, est décrite dans les guides techniques.


## Multi-langue

L'application est disponible nativement en Français, Anglais, Allemand, Espagne et Néerlandais.


## Accès rapide

L'application console est accessible une fois connecté avec le contexte /console

En développement local, l'application est généralement accessible :
- directement : `http://localhost:8081/console`
- via le gateway geOrchestra : `http://localhost:8080/console`

En environnement final, ajouter /console à votre nom de domaine pour y accéder.

Exemple https://demo.georchestra.org/console

L'espace d'administration fonctionnelle se trouve dans `Console > Manager`, ou directement sur `/console/manager`.
