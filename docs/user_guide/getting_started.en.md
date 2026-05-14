# Getting Started Quickly

This page provides first landmarks for administering rights from the graphical interface.

## Access the Manager

The administration area is available from `/console/manager`.

Depending on the installation, the URL can be:

- `http://localhost:8081/console/manager` for direct local access;
- `http://localhost:8080/console/manager` through the geOrchestra gateway in a development environment.

Access depends on the roles of the connected user. Common roles are:

- `SUPERUSER` for global administration;
- `ORGADMIN` for administration of a delegated scope.

## Understand the Dashboard

The dashboard gives a quick view of objects to administer: users, pending requests, organizations, roles, delegations and recent logs.

![Manager dashboard](../images/manager-home.png)

Use the cards to quickly access the corresponding lists. Counters help identify items to process, for example users or organizations waiting for validation.

## Minimal Workflow

To manage a user:

1. Open the `Users` tab.
2. Search for the user by name, identifier, email or organization.
3. Open their record.
4. Check their organization, status and roles.
5. Update the required information and save.

![User list](../images/manager-browse-all.png)

To create an account from the public interface:

1. Open `/console/account/new`.
2. Fill in the identity, email, organization and requested information.
3. Create the organization if it does not exist yet.
4. Submit the request.
5. Wait for validation if signup moderation is enabled.

![Account creation](../images/account-new.png)

## Key Points

- Application rights are carried by roles.
- Organization membership often determines the functional scope.
- A delegated administrator only sees objects included in their delegation.
- Sensitive actions are traced in administration logs.
