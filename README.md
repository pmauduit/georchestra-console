# About

A rewrite of geOrchestra's console webapp using updated versions of the dependencies, and ported to spring boot.

Current runtime target: Java 21.

# TODOs

* Get rid of the `org.georchestra.console.ws.backoffice.utils.ResponseUtil` class
* Get rid of `@Autowired` annotations and xml-based configurations
* rewrite tests to remove IT / Tests ? `integration` package ?
* Get rid of Junit4 & rewrite testsuite to Junit5
* Add a maven formatter plugin

## April, 2th 2026

* Add missing template for new password
* Add manager/browse/user
* remove ActiveMq link to https://github.com/georchestra/georchestra/pull/4644/
* Change manager/roles angular to thymeleaf, but adding role to user need validation click. In current version non click needed ( perhaps to do but not the time in the community sprint )

# (B)log

## April, 1st 2026

End migration JSP in Thymeleaf
Start migration Angular in Thymeleaf, for the moment some angular are copied in project to test quickly, to be removed
exemple http://localhost:8080/console/manager/logs Style need to be review
In createAccoutForm, new org with areas is not working

## March, 31th 2026

Added a dedicated development environment:

* `spring-boot-devtools` for local development
* a dedicated Docker stack in `docker/dev/docker-compose-dev.yaml`
* a dedicated development datadir in `docker/dev/datadir`
* a some Thymleaf template for userdetail and changingemail
* New feature add localisation for mail body

To run the app in dev:

1. start the dev Docker services

```bash
cd docker/dev
docker compose -f docker-compose-dev.yaml up -d
```

2. launch the Spring Boot app locally

```bash
mvn spring-boot:run \
  -Dspring-boot.run.jvmArguments="-Dgeorchestra.datadir=$(pwd)/docker/dev/datadir -DpgsqlHost=localhost -DpgsqlPort=15432 -DldapHost=localhost -DldapPort=1389" \
  -Dspring-boot.run.arguments=--server.port=8081
```

Then:

* direct access: `http://localhost:8081/console`
* through the gateway: `http://localhost:8080/console`


## July, 9th 2025

I WIP-ed a bit this morning on it, here is I went thus far:

1. creating a new spring boot app from start.spring.io along with the expected dependencies
2. added org.georchestra.georchestra-testcontainers as a dependency

I think that something is wrong in the way we are doing testcontainers, so I created the following issue:
georchestra/georchestra#4533 ; but I am pretty sure I created another one several weeks ago, as I already 
encountered a similar problem running the integration testsuite somewhere in geOrchestra.

Before integrating the existing code, `mvnw clean verify` works, and it launches 2 geOrchestra containers 
(ldap, db), next step is to import the existing code from the console (backend related), and start rewrite it
in a more “spring-boot” way (getting rid of xml config files, returning Java object and leave jackson do its
magick instead of building json strings ...).

Integrating the existing code, I have now a lot of compilation errors to deal with.

Some issues to solve when porting the former code:

* recaptcha v2 ? not sure where the backend vs frontend frontier is in regards to this feature
* porting code to newer library versions (javax → jakarta, ldaptive v2.x)
* issue with JSON hibernate type, is the dependency to hibernate-types-xy still needed ?
* rework rabbitMq activation in a more spring-boot fashion (dropping the xml definition files)

At the end of this day, I had still 129 errors, 3 warnings to fix.

## July, 16th 2025

Still WIP on integrating the existing code, fixing the compilation errors.

* added database-rider as dependency but I am still wondering if we should not rewrite the test using testcontainers.
* mockito upgrade was quite straightforward compilation-wise: just replace Matchers by ArgumentMatchers.
* A test NewAccountFormControllerTest is a bit tricky to port, as it was making use of powermock + a junit4 integration,
  leaving it for now. It also seems that powermock was used to mock reCaptcha, and we still don't know what to do
  with it, see previous section.

At the end of the session, only 19 compilation errors left. Many more in idea because of disfunctional lombok integration.

## July, 17th 2025

Fixed all compilation errors, but obviously the testsuite is broken:

```
[ERROR] Tests run: 219, Failures: 3, Errors: 19, Skipped: 4
```

## December, 11th 2025

The console is able to boot with `./mvnw spring-boot:run`. It is even able to provide
the `/internal/` webservices being used by GeoNetwork synchronization.
Unfortunately, performances are quite poor on huge LDAP tree, tested on the one from
Rennes-Métropole, I was hoping that it would perform faster than the former console.

## December,26th 2025

Trying to  write some tests to target the `/internal/` webservices, figuring out that
the spring-boot version being used is already outdated, and will require to upgrade to `4.0.x`
so that I could have the `WebTestClient` framework.

WIPPing a bit on the testsuite today, deactivating a test class, and the CICD turned green !

Wondering what is next though: shall I try to port some parts of the frontend and some JSP views
to thymeleaf ? How far should I go to make sure we are isofunctional ? Either improve test
coverage of each controller, or trying to get a frontend part somehow ?

The rabbitMq part is still broken though, but not my priority.
