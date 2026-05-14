# Global Overview

The manager home page presents the main administration areas. It is the starting point for processing requests and checking rights status.

![Manager global overview](../images/manager-home.png)

## Main Areas

The interface is organized around a few recurring areas:

- the geOrchestra header, shared by platform applications;
- the manager navigation: `Dashboard`, `Users`, `Orgs`, `Roles`, `Delegations`, `Logs`;
- summary cards, showing volumes and requests to process;
- result tables with search, sorting and pagination when necessary;
- detail tabs on users, organizations or roles.

## Rights Logic

The Console combines three concepts:

- **user**: an individual account, identified by a `uid`;
- **organization**: the account's organizational attachment;
- **role**: an application or administration right.

A super administrator can administer all objects. An organization administrator only acts on the organizations, users and roles delegated to them.

## Management Lists

Lists are used to quickly find objects to manage.

![Account navigation](../images/manager-browse-all.png)

In a list, common actions are:

- filter results with the search field;
- sort columns;
- open a detail record;
- access related objects, for example a user's organization;
- identify pending or expired objects.
