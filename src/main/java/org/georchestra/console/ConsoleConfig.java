package org.georchestra.console;

import org.georchestra.commons.configuration.GeorchestraConfiguration;
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
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.ldap.core.LdapTemplate;
import org.springframework.ldap.core.support.LdapContextSource;

import javax.sql.DataSource;

@Configuration
public class ConsoleConfig {

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

    public @Bean PasswordUtils passwordUtils() {
        return new PasswordUtils();
    }

    public @Bean EmailFactory emailFactory() {
        return new EmailFactory();
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

    public @Bean AccountDaoImpl accountDao(LdapTemplate ldapTemplate) {
        return new AccountDaoImpl(ldapTemplate);
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
