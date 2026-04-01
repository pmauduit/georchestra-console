package org.georchestra.console.autoconfiguration;

import org.georchestra.console.bs.ExpiredTokenCleanTask;
import org.georchestra.console.bs.ExpiredTokenManagement;
import org.georchestra.console.bs.ReCaptchaParameters;
import org.georchestra.console.bs.areas.AreasService;
import org.georchestra.console.dao.AdminLogDao;
import org.georchestra.console.dao.AdvancedDelegationDao;
import org.georchestra.console.ds.AccountGDPRDao;
import org.georchestra.console.ds.AccountGDPRDaoImpl;
import org.georchestra.console.ds.UserTokenDao;
import org.georchestra.console.mailservice.EmailFactory;
import org.georchestra.console.ws.backoffice.users.GDPRAccountWorker;
import org.georchestra.console.ws.backoffice.users.UserInfoExporter;
import org.georchestra.console.ws.backoffice.users.UserInfoExporterImpl;
import org.georchestra.console.ws.utils.LogUtils;
import org.georchestra.console.ws.utils.PasswordUtils;
import org.georchestra.console.ws.utils.Validation;
import org.georchestra.ds.LdapDaoProperties;
import org.georchestra.ds.orgs.OrgExtLdapWrapper;
import org.georchestra.ds.orgs.OrgLdapWrapper;
import org.georchestra.ds.orgs.OrgsDao;
import org.georchestra.ds.orgs.OrgsDaoImpl;
import org.georchestra.ds.roles.RoleDao;
import org.georchestra.ds.roles.RoleDaoImpl;
import org.georchestra.ds.roles.RoleProtected;
import org.georchestra.ds.security.OrganizationMapper;
import org.georchestra.ds.security.OrganizationMapperImpl;
import org.georchestra.ds.security.OrganizationsApiImpl;
import org.georchestra.ds.security.RoleMapper;
import org.georchestra.ds.security.RoleMapperImpl;
import org.georchestra.ds.security.RolesApiImpl;
import org.georchestra.ds.security.UserMapper;
import org.georchestra.ds.security.UserMapperImpl;
import org.georchestra.ds.security.UsersApiImpl;
import org.georchestra.ds.users.AccountDao;
import org.georchestra.ds.users.AccountDaoImpl;
import org.georchestra.ds.users.UserRule;
import org.georchestra.security.api.OrganizationsApi;
import org.georchestra.security.api.RolesApi;
import org.georchestra.security.api.UsersApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.ldap.core.LdapTemplate;

import javax.sql.DataSource;

@Configuration
public class ConsoleConfiguration {

    public @Bean UserMapper userMapper() {
        return new UserMapperImpl();
    }

    public @Bean UsersApi usersApi() {
        return new UsersApiImpl();
    }

    public @Bean OrganizationMapper organizationMapper() {
        return new OrganizationMapperImpl();
    }

    public @Bean OrganizationsApi organizationsApi() {
        return new OrganizationsApiImpl();
    }

    public @Bean RoleMapper roleMapper() {
        return new RoleMapperImpl();
    }

    public @Bean RolesApi rolesApi() {
        return new RolesApiImpl();
    }

    public @Bean ReCaptchaParameters reCaptchaParameters() {
        // TODO
        return new ReCaptchaParameters("aaaa", "secret", "http://localhost:6000/verify");
    }

    public @Bean PasswordUtils passwordUtils(
            @Value("${password.minimumLength:8}") int minimumLength,
            @Value("${password.requireLowers:false}") boolean requireLowers,
            @Value("${password.requireUppers:false}") boolean requireUppers,
            @Value("${password.requireDigits:false}") boolean requireDigits,
            @Value("${password.requireSpecials:false}") boolean requireSpecials) {
        PasswordUtils passwordUtils = new PasswordUtils();
        passwordUtils.setMinimumLength(minimumLength);
        passwordUtils.setRequireLowers(requireLowers);
        passwordUtils.setRequireUppers(requireUppers);
        passwordUtils.setRequireDigits(requireDigits);
        passwordUtils.setRequireSpecials(requireSpecials);
        return passwordUtils;
    }

    public @Bean EmailFactory emailFactory(
            @Value("${smtpHost:localhost}") String smtpHost,
            @Value("${smtpPort:25}") int smtpPort,
            @Value("${emailHtml:false}") boolean emailHtml,
            @Value("${replyTo:}") String replyTo,
            @Value("${from:}") String from,
            @Value("${templateEncoding:UTF-8}") String templateEncoding,
            @Value("${domainName:localhost}") String domainName,
            @Value("${publicUrl:}") String publicUrl,
            @Value("${instanceName:geOrchestra}") String instanceName,
            @Value("${administratorEmail:georchestra@localhost}") String administratorEmail,
            @Value("${subject.account.created:}") String accountCreatedSubject,
            @Value("${subject.account.in.process:}") String accountInProcessSubject,
            @Value("${subject.requires.moderation:}") String requiresModerationSubject,
            @Value("${subject.change.password:}") String changePasswordSubject,
            @Value("${subject.change.password-oauth2:}") String changePasswordOAuth2Subject,
            @Value("${subject.change.email:}") String changeEmailSubject,
            @Value("${subject.account.uid.renamed:}") String accountUidRenamedSubject,
            @Value("${subject.new.account.notification:}") String newAccountNotificationSubject,
            @Value("${subject.new.oauth2account.notification:}") String newOAuth2AccountNotificationSubject) {
        EmailFactory factory = new EmailFactory();
        factory.setSmtpHost(smtpHost);
        factory.setSmtpPort(smtpPort);
        factory.setEmailHtml(emailHtml);
        factory.setReplyTo(replyTo == null || replyTo.isBlank() ? administratorEmail : replyTo);
        factory.setFrom(from == null || from.isBlank() ? administratorEmail : from);
        factory.setBodyEncoding("UTF-8");
        factory.setSubjectEncoding("UTF-8");
        factory.setTemplateEncoding(templateEncoding);
        factory.setAccountWasCreatedEmailFile("newaccount-was-created-template.txt");
        factory.setAccountWasCreatedEmailSubject(
                fallbackSubject(accountCreatedSubject, "[%s] Your account has been created", instanceName));
        factory.setAccountCreationInProcessEmailFile("account-creation-in-progress-template.txt");
        factory.setAccountCreationInProcessEmailSubject(
                fallbackSubject(accountInProcessSubject, "[%s] Your new account is waiting for validation", instanceName));
        factory.setNewAccountRequiresModerationEmailFile("newaccount-requires-moderation-template.txt");
        factory.setNewAccountRequiresModerationEmailSubject(
                fallbackSubject(requiresModerationSubject, "[%s] New account waiting for validation", instanceName));
        factory.setChangePasswordEmailFile("changepassword-email-template.txt");
        factory.setChangePasswordEmailSubject(
                fallbackSubject(changePasswordSubject, "[%s] Update your password", instanceName));
        factory.setChangePasswordOAuth2EmailFile("changepasswordoauth2-email-template.txt");
        factory.setChangePasswordOAuth2EmailSubject(
                fallbackSubject(changePasswordOAuth2Subject, "[%s] Update your password", instanceName));
        factory.setChangeEmailAddressEmailFile("changeemail-email-template.txt");
        factory.setChangeEmailAddressEmailSubject(
                fallbackSubject(changeEmailSubject, "[%s] Update your e-mail address", instanceName));
        factory.setAccountUidRenamedEmailFile("account-uid-renamed.txt");
        factory.setAccountUidRenamedEmailSubject(
                fallbackSubject(accountUidRenamedSubject, "[%s] New login for your account", instanceName));
        factory.setNewAccountNotificationEmailFile("newaccount-notification-template.txt");
        factory.setNewOAuth2AccountNotificationEmailFile("new-oauth2-account-notification-template.txt");
        factory.setNewAccountNotificationEmailSubject(
                fallbackSubject(newAccountNotificationSubject, "[%s] New account created", instanceName));
        factory.setNewOAuth2AccountNotificationEmailSubject(
                fallbackSubject(newOAuth2AccountNotificationSubject, "[%s] New OAuth2 account created", instanceName));
        factory.setPublicUrl(publicUrl == null || publicUrl.isBlank() ? "https://" + domainName : publicUrl);
        factory.setInstanceName(instanceName);
        factory.setAdministratorEmail(administratorEmail);
        return factory;
    }

    private String fallbackSubject(String configuredValue, String defaultPattern, String instanceName) {
        return configuredValue == null || configuredValue.isBlank()
                ? defaultPattern.formatted(instanceName)
                : configuredValue;
    }

    public @Bean UserInfoExporter userInfoExporter(AccountDao accountDao, OrgsDao orgsDao) {
        return new UserInfoExporterImpl(accountDao,  orgsDao);
    }

    public @Bean AccountGDPRDao accountGDPRDao() {
        return new AccountGDPRDaoImpl();
    }

    public @Bean GDPRAccountWorker gdprAccountWorker(AccountGDPRDao accountGDPRDao,
                                                     UserInfoExporter userInfoExporter,
                                                     AccountDao accountDao) {
        return new GDPRAccountWorker(accountGDPRDao, userInfoExporter, accountDao);
    }

    /*
    public @Bean GeorchestraConfiguration georchestraConfiguration() {
        return new GeorchestraConfiguration("/console"); // TODO same as below
    }
     */

    public @Bean AreasService areasService(OrgsDao orgsDao /*,
                                           GeorchestraConfiguration georConfig */) {
        // TODO 2nd parameter (GeorchestraConfiguration) still relies on javax.servlet
        // not available here in the context (jakarta.servlet)
        // TODO revisit configuration / 3rd parameter
        return new AreasService(orgsDao, null, "/console/public/areas.json");
    }

    public @Bean UserRule userRule() {
        return new UserRule();
    }

    public @Bean LogUtils logUtils(AdminLogDao adminLogDao, RoleProtected roleProtected) {
        return new LogUtils(adminLogDao, roleProtected);
    }

    public @Bean Validation validation() {
        // TODO: rethink configuration with classes to map from the yaml files in resources and/or datadir
        return new Validation("");
    }

    public @Bean AdvancedDelegationDao advancedDelegationDao() {
        return new AdvancedDelegationDao();
    }

    public @Bean RoleProtected roleProtected() {
        return new RoleProtected();
    }

    public @Bean OrgLdapWrapper orgLdapWrapper() {
        return new OrgLdapWrapper();
    }

    public @Bean OrgExtLdapWrapper orgExtLdapWrapper() {
        return new OrgExtLdapWrapper();
    }

    public @Bean OrgsDaoImpl orgsDao() {
        return new OrgsDaoImpl();
    }

    public @Bean LdapDaoProperties ldapDaoProperties() {
        // TODO: 1. it's redundant with spring's LdapTemplate / LdapContextSource ?
        // 2. should be configurable in console.yaml
        return new LdapDaoProperties()
                .setBasePath("dc=georchestra,dc=org")
                .setOrgSearchBaseDN("ou=orgs")
                .setOrgTypeValues("georchestraOrg")
                .setPendingOrgSearchBaseDN("ou=pendingorgs")
                .setRoleSearchBaseDN("ou=roles")
                .setPendingUserSearchBaseDN("ou=pendingusers")
                .setUserSearchBaseDN("ou=users");
    }

    public @Bean AccountDaoImpl accountDao(LdapTemplate ldapTemplate, LdapDaoProperties daoProperties) {

        AccountDaoImpl accountDao = new AccountDaoImpl(ldapTemplate);
        accountDao.setLdapDaoProperties(daoProperties);
        accountDao.init();
        return accountDao;
    }

    public @Bean RoleDao roleDao() {
        return new RoleDaoImpl();
    }

    public @Bean UserTokenDao userTokenDao(DataSource dataSource) {
        return new UserTokenDao(dataSource);
    }

    public @Bean ExpiredTokenCleanTask expiredTokenCleanTask(UserTokenDao userTokenDao) {
        return new ExpiredTokenCleanTask(userTokenDao);
    }

    public @Bean ExpiredTokenManagement expiredTokenManagement(
            ExpiredTokenCleanTask expiredTokenCleanTask) {
        return  new ExpiredTokenManagement(expiredTokenCleanTask);
    }

}
