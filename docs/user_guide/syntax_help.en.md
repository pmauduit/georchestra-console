# Functional Rules

This page summarizes the functional rules to know before modifying rights in the Console.

## Rights Model

The Console mainly handles three objects:

- a **user**, identified by a `uid`;
- an **organization**, representing the user's functional attachment;
- a **role**, granting rights in geOrchestra or in a connected application.

Roles are stored in LDAP. geOrchestra applications then consume these roles to authorize or deny actions.

## Common Roles

The following roles have a specific meaning:

- `SUPERUSER`: global Console administration;
- `ORGADMIN`: administration of a delegated scope;
- `USER`: standard user;
- `PENDING`: account waiting for validation;
- `EXPIRED`: expired account;
- `TEMPORARY`: virtual role used to group some temporary accounts;
- `REFERENT`: functional role that can be used to identify a contact person.

Application roles can be specific to each platform. They should remain explicit and documented at organization level.

## Delegations

A delegation gives an organization administrator the right to act on a precise scope.

It contains:

- administrable organizations;
- assignable or removable roles.

A delegated administrator should only see and modify users belonging to delegated organizations, and only roles included in the delegation.

## Pending Organizations

When signup moderation is enabled, an account request can create or reference a pending organization.

An account attached to a pending organization should not be validated before the organization is validated.

## Protected Accounts

Some technical accounts can be protected against modification or deletion.

The list is technically configured with `protectedUsersList`.

## Best Practices

- Create readable application roles in uppercase, for example `MAPSTORE_ADMIN`.
- Avoid granting `SUPERUSER` for a need limited to one organization.
- Prefer a targeted `ORGADMIN` delegation when an administrator should manage only one scope.
- Check logs after a sensitive action.
- Locally document the meaning of roles specific to the platform.

!!! warning "Irreversible action"
    Account, organization or role deletions can have immediate effects on access. Check the scope and dependencies before deleting.
