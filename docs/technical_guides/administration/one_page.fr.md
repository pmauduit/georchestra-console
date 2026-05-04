# Modèle de droits et délégations

La Console s'appuie sur un modèle simple : les utilisateurs appartiennent à des organisations et reçoivent des rôles. Les délégations limitent ce qu'un administrateur d'organisation peut voir et modifier.

## Super-administrateur

Un utilisateur ayant le rôle `SUPERUSER` peut administrer l'ensemble des comptes, organisations, rôles, délégations et logs.

Ce rôle doit rester limité à un petit nombre de comptes d'exploitation ou d'administration globale.

## Administrateur d'organisation

Un utilisateur ayant le rôle `ORGADMIN` n'a pas automatiquement un accès global.

Son périmètre dépend des délégations configurées :

- organisations administrables ;
- rôles attribuables ou retirables.

Si un utilisateur n'a pas de délégation, son rôle `ORGADMIN` ne suffit pas à lui donner un périmètre utile dans le manager.

## Effets des délégations

Les délégations filtrent :

- les comptes visibles ;
- les organisations visibles ;
- les rôles visibles ;
- les utilisateurs sur lesquels les logs peuvent être consultés ;
- les affectations de rôles possibles.

Elles sont donc au coeur de la gestion de droits fonctionnelle.

## Données auditées

Les actions suivantes sont tracées dans les logs d'administration :

- création, modification et suppression de comptes ;
- validation ou refus de comptes en attente ;
- création, modification et suppression d'organisations ;
- validation ou refus d'organisations en attente ;
- création, modification et suppression de rôles ;
- ajout ou retrait de rôles à des utilisateurs ;
- envoi de messages depuis l'interface.

## Cohérence avec les applications

La Console administre les rôles, mais chaque application geOrchestra reste responsable de l'interprétation de ces rôles.

Avant de créer ou supprimer un rôle, vérifiez donc les applications qui le consomment : gateway, GeoServer, GeoNetwork, MapStore ou application métier spécifique.
