# Functional Rules

This page summarizes the functional rules to understand before changing access rights in the Console.

## Rights Model

The Console mainly manages three objects:

- a **user**, identified by a `uid`;
- an **organization**, which defines the user's functional affiliation;
- a **role**, which grants rights in geOrchestra or in a connected application.

Roles are stored in LDAP. geOrchestra applications then consume these roles to authorize or deny actions.

## Common Roles

- `SUPERUSER`: global Console administration;
- `ORGADMIN`: administration of a delegated scope;
- `USER`: standard user;
- `PENDING`: account waiting for validation;
- `EXPIRED`: expired account;
- `TEMPORARY`: virtual role for temporary users;
- `REFERENT`: functional role that can identify a referent.

Application roles can be specific to each platform and should be documented locally.

## Delegations

A delegation gives an organization administrator the right to act on a defined scope.

It contains:

- manageable organizations;
- roles that can be granted or removed.

A delegated administrator should only see and modify users belonging to delegated organizations, and only the roles included in the delegation.

## Protected Accounts

Some technical accounts can be protected against modification or deletion.

The list is configured with `protectedUsersList`.

!!! warning "Irreversible action"
    Deleting users, organizations or roles can immediately affect access rights. Check the scope and dependencies before deleting.
