# Installation

## Lancement local

Depuis la racine du module `georchestra-console`, démarrez d'abord les services Docker :

```bash
cd docker/dev
docker compose -f docker-compose-dev.yaml up -d
```

Revenez ensuite à la racine du module et lancez l'application Spring Boot :

```bash
./mvnw spring-boot:run \
  -Dspring-boot.run.jvmArguments="-Dgeorchestra.datadir=$(pwd)/docker/dev/datadir" \
  -Dspring-boot.run.arguments=--server.port=8081
```

L'application est alors disponible :

- en accès direct : `http://localhost:8081/console`
- via le gateway : `http://localhost:8080/console`

L'interface d'administration est disponible sur `/console/manager`.

## SMTP local

En développement, Mailpit est exposé sur :

- SMTP : `localhost:1025`
- interface web : `http://localhost:8025`

Utilisez cette interface pour vérifier les mails de création de compte, validation, récupération de mot de passe ou changement d'e-mail.

## Documentation locale

La documentation MkDocs peut être lancée avec :

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r mkdocs_requirements.txt
mkdocs serve
```

Elle est ensuite accessible sur `http://127.0.0.1:8000/`.

## Swagger de l'API interne

Une interface Swagger UI est disponible pour l'API interne exposée sous `/internal/*`.

URLs utiles en local :

- Swagger UI direct : `http://localhost:8081/console/swagger-ui/index.html`
- Swagger UI via gateway : `http://localhost:8080/console/swagger-ui/index.html`
- spécification OpenAPI directe : `http://localhost:8081/console/v3/api-docs/internal`
- spécification OpenAPI via gateway : `http://localhost:8080/console/v3/api-docs/internal`

## Déploiement

Pour un déploiement intégré à geOrchestra, conservez les principes suivants :

- exposer la Console sous `/console` ;
- utiliser le datadir pour la configuration locale ;
- placer l'application derrière le gateway ou un reverse proxy compatible avec les en-têtes de sécurité geOrchestra ;
- configurer LDAP, PostgreSQL et SMTP avec des comptes techniques dédiés ;
- vérifier que `publicUrl` correspond à l'URL publique utilisée dans les mails.

## Initialisation de la base

Le projet ne fournit pas encore de mécanisme automatique de migration de schéma.

En plus des tables gérées via JPA, certains objets PostgreSQL propres à la Console doivent être créés manuellement lors de la première installation :

```bash
psql -f src/main/sql/console-bootstrap.sql
```

Ce script doit être exécuté une seule fois sur une base cible vierge avant le premier démarrage de l'application.

Il est volontairement stocké hors de `src/main/resources`, afin de ne pas être embarqué dans le jar applicatif ni exécuté automatiquement par Spring Boot.

## Paquet Debian et service systemd

La Console peut être construite sous forme de paquet Debian. Ce paquet installe l'application Spring Boot, le fichier d'unité systemd et les scripts Debian nécessaires au rechargement de systemd.

Le paquet prépare un service `georchestra-console.service`. Celui-ci lance le jar avec le datadir geOrchestra :

```ini
ExecStart=/usr/bin/java -Dgeorchestra.datadir=/etc/georchestra -jar /srv/apps/georchestra-console/georchestra-console.jar
```

Le service est prévu pour s'exécuter avec l'utilisateur système `georchestra`. L'installation du paquet crée cet utilisateur s'il n'existe pas déjà.

Après installation, le service peut être activé et démarré avec systemd :

```bash
sudo systemctl enable georchestra-console.service
sudo systemctl start georchestra-console.service
```

Ce mode de déploiement est utile lorsque la Console est exploitée comme application autonome derrière le gateway geOrchestra ou derrière un reverse proxy, sans conteneur applicatif Java externe.
