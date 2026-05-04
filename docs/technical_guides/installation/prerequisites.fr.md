# Prérequis

## Matériel

Les besoins dépendent surtout de la taille du LDAP et du volume de logs.

Pour un environnement de développement local, prévoyez au minimum :

- 2 CPU ;
- 5 Go de mémoire disponible ;
- 10 Go d'espace disque pour les images Docker, la base et les dépendances Maven.

## Logiciel

Pour développer ou lancer la Console localement :

- Java 21 ;
- Docker et Docker Compose ;
- Git ;
- le Maven Wrapper fourni par le projet : `./mvnw`.

Le Maven Wrapper évite d'imposer une installation Maven globale. Les commandes Maven documentées doivent donc utiliser `./mvnw`.

Pour lancer la documentation locale :

- Python 3 ;
- `pip` ;
- les dépendances listées dans `mkdocs_requirements.txt`.

## Services nécessaires

La Console a besoin des services suivants :

- un serveur LDAP compatible avec le modèle geOrchestra ;
- une base PostgreSQL ;
- un serveur SMTP ;
- un gateway ou reverse proxy transmettant les en-têtes de sécurité ;
- un datadir geOrchestra contenant les fichiers de configuration.
