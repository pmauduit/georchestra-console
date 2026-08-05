-- Bootstrap script for the Console-specific tables not managed by JPA.
-- Execute this script once during the first installation of the application.
--
-- The application does not run this script automatically.
-- It is intentionally stored outside src/main/resources so it is not packaged in the jar.

CREATE TABLE console.admin_attachments (
  id bigserial,
  content oid,
  mimetype character varying(255),
  name character varying(255),
  CONSTRAINT admin_attachments_pkey PRIMARY KEY (id)
);

CREATE TABLE console.email_template (
  id bigserial,
  content text,
  name character varying(255),
  CONSTRAINT email_template_pkey PRIMARY KEY (id)
);

CREATE TABLE console.admin_emails (
  id bigserial,
  body text,
  date timestamp without time zone,
  recipient character varying(255),
  sender text,
  subject character varying(255),
  CONSTRAINT admin_emails_pkey PRIMARY KEY (id)
);

CREATE TABLE console.delegations
(
  uid character varying(255) NOT NULL,
  orgs character varying[],
  roles character varying[],
  CONSTRAINT delegations_pkey PRIMARY KEY (uid)
);

INSERT INTO console.email_template (content, name) VALUES ('Bonjour et bienvenue', 'Hello');
INSERT INTO console.email_template (content, name) VALUES ('Votre compte a été supprimé', 'Deleted');

INSERT INTO console.admin_emails (body, date, recipient, sender, subject) VALUES ( 'Votre compte a été suprimé', '2016-05-18 09:31:47.928', 'testadmin', 'testadmin', 'Deleted');

INSERT INTO console.delegations (uid, orgs, roles) VALUES ('testdelegatedadmin', '{psc, c2c}', '{GN_EDITOR}');
