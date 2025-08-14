# About

A rewrite of geOrchestra's console webapp using updated versions of the dependencies, and ported to spring boot.


# (B)log

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