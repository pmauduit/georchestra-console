# User Administration

This page describes functional account administration from the manager interface. It is intended for superusers and delegated organization administrators.

## What the Interface Allows

From `Users`, you can usually:

- browse accounts visible under your permissions;
- search for a user by name, login, organization or e-mail;
- open a user details page;
- create a user;
- update account information;
- attach the user to an organization;
- manage visible roles;
- validate or reject a pending account;
- review messages and logs related to a user;
- delete an account when the action is allowed.

![Navigating in the users list](../images/manager-browse-all.png)

## Typical Workflow

### Review a User

1. Open the `Users` tab.
2. Use search or sorting.
3. Click the user name.
4. Review the organization, roles, e-mail and account status.

![User details screen](../images/account-userdetails.png)

### Create a User

1. Open `Users`.
2. Click `New user`.
3. Fill the required fields: surname, first name, e-mail, login and organization.
4. Choose the target organization.
5. Save.

The `USER` role is added automatically at creation. Organization-related roles may also be applied depending on LDAP configuration.

### Update a User

Depending on permissions, you may:

- correct the name or e-mail address;
- change the linked organization;
- define an expiration date;
- add an internal note;
- update the login when the account is not external;
- confirm a pending account;
- manage visible roles.

When the organization changes, roles linked to the previous organization are removed and roles linked to the new organization may be added.

### Manage Roles

The `Roles` tab usually separates system roles from application roles.

Check the roles to grant, uncheck the roles to remove, then save.

A delegated administrator can only modify roles included in their delegation.

## Points of Attention

- An organization administrator does not necessarily see every user.
- Some protected accounts cannot be modified.
- External or OAuth2 accounts may prevent login or password changes.
- Some actions depend on administration delegations, not only on the global role.
- Important actions are recorded in administration logs.
