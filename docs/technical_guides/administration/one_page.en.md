# Rights Model and Delegations

The Console uses a simple model: users belong to organizations and receive roles. Delegations limit what an organization administrator can see and modify.

## Super Administrator

A user with the `SUPERUSER` role can administer all accounts, organizations, roles, delegations and logs.

This role should remain limited to a small number of operational or global administration accounts.

## Organization Administrator

A user with the `ORGADMIN` role does not automatically have global access.

Their scope depends on configured delegations:

- organizations they can administer;
- roles they can assign or remove.

If a user has no delegation, the `ORGADMIN` role alone is not enough to give them a useful scope in the manager.

## Effects of Delegations

Delegations filter:

- visible accounts;
- visible organizations;
- visible roles;
- users whose logs can be consulted;
- possible role assignments.

They are therefore central to functional rights management.

## Audited Data

The following actions are traced in administration logs:

- account creation, update and deletion;
- validation or refusal of pending accounts;
- organization creation, update and deletion;
- validation or refusal of pending organizations;
- role creation, update and deletion;
- adding or removing roles from users;
- sending messages from the interface.

## Consistency with Applications

The Console administers roles, but each geOrchestra application remains responsible for interpreting those roles.

Before creating or deleting a role, check the applications that consume it: gateway, GeoServer, GeoNetwork, MapStore or a specific business application.
