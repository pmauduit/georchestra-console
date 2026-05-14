# User Administration

This page describes functional account administration from the manager interface.

It is intended for super administrators and organization administrators with a delegation.

## What the Interface Allows

From the `Users` tab, you can generally:

- browse accounts visible according to your permissions;
- search for a user by name, identifier, organization or email;
- open a detailed user record;
- create a user;
- update account information;
- attach the user to an organization;
- manage visible roles;
- validate or refuse a pending account;
- consult messages and logs related to the user;
- delete an account if the action is authorized.

![Navigation in the user list](../images/manager-browse-all.png)

## Typical Workflow

### Consult a User

1. Open the `Users` tab.
2. Use search or sorting.
3. Click the user's name.
4. Check the organization, roles, email and account status.

![User detail record](../images/account-userdetails.png)

### Create a User

1. Open `Users`.
2. Click `New user`.
3. Fill in the mandatory fields: last name, first name, email, identifier and organization.
4. Choose the attached organization.
5. Save.

At creation, the `USER` role is added automatically. Roles linked to the organization can also be applied depending on LDAP configuration.

### Update a User

Depending on your rights, you can:

- correct the last name, first name or email;
- change the organization attachment;
- set an expiration date;
- add an internal note;
- update the identifier if the account is not external;
- confirm a pending account;
- act on visible roles.

When the organization attachment changes, roles linked to the former organization are removed and roles from the new organization may be added.

### Manage a User's Roles

The `Roles` tab of the user record generally separates:

- system or administration roles;
- application roles.

Check the roles to assign, uncheck those to remove, then save.

A delegated administrator can only modify roles included in their delegation.

### Process Pending Accounts

Pending accounts appear in the `pending` view.

Before validation, check:

- the user's identity;
- the requested organization;
- the email;
- any contact information;
- the existence of an associated pending organization.

A user cannot be confirmed if their organization is still pending validation.

### Delete a User

The `Manage` tab allows deleting a user if the action is authorized.

Deletion removes the account from LDAP, removes its roles and deletes any associated delegation.

## Points of Attention

- An organization administrator does not necessarily see all users.
- Some protected accounts cannot be modified.
- External or OAuth2 accounts do not always allow changing the identifier or password.
- Some actions depend on administration delegations and not only on the global role.
- Important actions are recorded in administration logs to trace changes.
- Mail sending depends on technical configuration; when enabled, messages sent to a user can be consulted from their record.
