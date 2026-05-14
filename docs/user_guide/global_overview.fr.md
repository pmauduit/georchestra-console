# Vue globale

La page d'accueil du manager présente les principaux domaines d'administration. Elle sert de point de départ pour traiter les demandes et vérifier l'état des droits.

![Vue globale du manager](../images/manager-home.png)

## Zones principales

L'interface est organisée autour de quelques zones récurrentes :

- l'en-tête geOrchestra, commun aux applications de la plateforme ;
- la navigation du manager : `Dashboard`, `Users`, `Orgs`, `Roles`, `Delegations`, `Logs` ;
- les cartes de synthèse, qui affichent les volumes et les demandes à traiter ;
- les tableaux de résultats avec recherche, tri et pagination quand c'est nécessaire ;
- les onglets de détail sur les utilisateurs, organisations ou rôles.

## Logique de droits

La Console combine trois notions :

- **utilisateur** : compte individuel, identifié par un `uid` ;
- **organisation** : structure de rattachement du compte ;
- **rôle** : droit applicatif ou droit d'administration.

Un super-administrateur peut administrer l'ensemble des objets. Un administrateur d'organisation agit uniquement sur les organisations, utilisateurs et rôles qui lui ont été délégués.

## Listes de gestion

Les listes servent à retrouver rapidement les objets à gérer.

![Navigation dans les comptes](../images/manager-browse-all.png)

Dans une liste, les actions fréquentes sont :

- filtrer les résultats avec le champ de recherche ;
- trier les colonnes ;
- ouvrir une fiche de détail ;
- accéder aux objets liés, par exemple l'organisation d'un utilisateur ;
- repérer les objets en attente ou expirés.
