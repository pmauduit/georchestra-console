# Toolbar or Menu

The manager menu groups the screens used to administer rights.

## Dashboard

The dashboard summarizes accounts, organizations, roles and recent logs.

It is useful to:

- identify pending accounts;
- identify expired accounts;
- quickly access pending organizations;
- consult the latest administration actions.

## Users

The `Users` tab lets you browse accounts visible to the current administrator.

The filters on the left provide access to the main views:

- all visible users;
- pending users;
- expired users;
- users by visible role.

From the list, a user record can be opened.

![User list](../images/manager-browse-all.png)

A user record contains several tabs:

- `Infos` for identity, email, organization, expiration and account metadata;
- `Roles` to add or remove roles;
- `Messages` to consult messages sent to the user and send a message when mail sending is enabled in the configuration;
- `Logs` to consult administration actions related to this account;
- `Manage` to delete the account if the action is authorized.

## Orgs

The `Orgs` tab is used to manage organizations.

A super administrator can create an organization, update its information and delete an organization. A delegated administrator only sees organizations included in their scope.

The main information is:

- name;
- short name;
- organization type;
- email and website;
- organization identifier;
- address;
- competence area if this feature is enabled.

## Roles

The `Roles` tab is used to manage application roles.

A role represents a right or group of rights consumed by other geOrchestra applications. System roles such as `SUPERUSER`, `ORGADMIN`, `USER`, `PENDING` or `EXPIRED` have a specific functional meaning.

From a role record, it is possible to:

- update its identifier or description if the role is not protected;
- consult member users;
- add or remove users;
- delete the role if the action is authorized.

## Delegations

The `Delegations` tab is reserved for super administrators.

A delegation associates an administrator user with:

- a list of organizations they can administer;
- a list of roles they can assign or remove.

This delegation limits what an organization administrator can see and modify in the manager.

## Logs

The `Logs` tab displays administration actions.

Available filters can retrieve an action by:

- author;
- target;
- action type;
- period.

Logs make it possible to trace changes performed in the manager. They are important to understand who created, updated, validated or deleted an account, organization or role.

## Messages and Mails

The `Messages` tab on a user record gives access to messages associated with the account.

When mail sending is enabled in the technical configuration, the Console can send messages related to the main events in an account lifecycle, for example creation, validation, email address change or password recovery.

Sent messages remain available from the user record, allowing an administrator to check what was transmitted to the user.

## Account Pages

Outside the manager, several pages let users manage their own account:

- account creation;
- viewing and updating personal information;
- email change;
- password change or recovery;
- personal data download or deletion if GDPR features are enabled.

![Account details](../images/account-userdetails.png)

![Email change](../images/account-changeEmail.png)

![Password recovery](../images/account-passwordRecovery.png)
