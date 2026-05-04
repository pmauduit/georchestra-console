# Administrer techniquement

Cette section décrit les éléments techniques à connaître pour exploiter la Console.

Elle ne remplace pas le guide utilisateur : les actions réalisées depuis l'interface graphique sont décrites dans le guide utilisateur. Ici, l'objectif est de comprendre les données manipulées, les dépendances et les points de vigilance.

## Données principales

La Console manipule plusieurs familles de données :

- les comptes utilisateurs, stockés dans le LDAP ;
- les organisations, stockées dans le LDAP ;
- les rôles et associations utilisateurs/rôles, stockés dans le LDAP ;
- les délégations d'administration, stockées en base PostgreSQL ;
- les logs d'administration, stockés en base PostgreSQL ;
- les messages, modèles de messages et pièces jointes, stockés en base PostgreSQL ;
- les tokens de récupération de mot de passe ou de changement d'e-mail, stockés en base PostgreSQL.

## Responsabilités d'exploitation

L'exploitant doit maintenir :

- la connectivité LDAP ;
- la connectivité PostgreSQL ;
- la configuration SMTP ;
- le datadir geOrchestra ;
- les modèles de mails personnalisés ;
- les fichiers GeoJSON utilisés pour les zones de compétence ;
- les règles d'accès du gateway ou du reverse proxy.

## Points de vigilance

- Une erreur LDAP peut empêcher la lecture ou la modification des comptes, organisations et rôles.
- Une erreur PostgreSQL peut empêcher l'affichage des logs, délégations et messages.
- Une mauvaise configuration SMTP peut bloquer les workflows de création de compte, changement d'e-mail ou récupération de mot de passe.
- Le header de pré-authentification doit fournir au minimum l'identifiant utilisateur attendu par l'application.

![Illustration administration technique](images/gestion_donnees.jpg)
