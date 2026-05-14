# Tests

## Tests automatisés

Le projet suit la structure Maven standard :

- tests unitaires et de slices dans `src/test/java` ;
- tests d'intégration dans `src/test/java`, nommés `*IT` ;
- fixtures dans `src/test/resources`.

Commandes utiles :

```bash
./mvnw test
./mvnw verify
./mvnw -Dtest=org.georchestra.console.boot.ConsoleApplicationTests test
./mvnw -Dit.test=org.georchestra.console.boot.AxeCoreAccessibilityIT verify
```

`./mvnw test` lance les tests rapides via Surefire.

`./mvnw verify` lance les tests rapides et les tests d'intégration via Failsafe.

## Vérifications fonctionnelles manuelles

Après installation, vérifiez au minimum :

1. ouverture de `/console/manager` avec un utilisateur `SUPERUSER` ;
2. affichage de la liste des utilisateurs ;
3. affichage de la liste des organisations ;
4. affichage de la liste des rôles ;
5. création ou modification d'un utilisateur de test ;
6. ajout puis retrait d'un rôle applicatif ;
7. affichage des logs d'administration ;
8. envoi d'un mail de récupération de mot de passe ;
9. accès à `/console/internal/users` si les API internes sont exposées au bon périmètre.

## Documentation

Pour vérifier la documentation :

```bash
mkdocs build --strict
```

En développement, vous pouvez utiliser :

```bash
mkdocs serve
```

La documentation est alors visible sur `http://127.0.0.1:8000/`.
