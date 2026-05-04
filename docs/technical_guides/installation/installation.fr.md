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

## Déploiement

Pour un déploiement intégré à geOrchestra, conservez les principes suivants :

- exposer la Console sous `/console` ;
- utiliser le datadir pour la configuration locale ;
- placer l'application derrière le gateway ou un reverse proxy compatible avec les en-têtes de sécurité geOrchestra ;
- configurer LDAP, PostgreSQL et SMTP avec des comptes techniques dédiés ;
- vérifier que `publicUrl` correspond à l'URL publique utilisée dans les mails.
