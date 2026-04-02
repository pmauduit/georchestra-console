/*
 * Copyright (C) 2009-2025 by the geOrchestra PSC
 *
 * This file is part of geOrchestra.
 *
 * geOrchestra is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * geOrchestra is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * geOrchestra.  If not, see <http://www.gnu.org/licenses/>.
 */
package org.georchestra.console.ws.backoffice.users;

import java.text.SimpleDateFormat;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.georchestra.console.dao.AdvancedDelegationDao;
import org.georchestra.console.dao.DelegationDao;
import org.georchestra.console.dto.SimpleAccount;
import org.georchestra.console.model.DelegationEntry;
import org.georchestra.ds.DataServiceException;
import org.georchestra.ds.orgs.Org;
import org.georchestra.ds.orgs.OrgsDao;
import org.georchestra.ds.roles.Role;
import org.georchestra.ds.roles.RoleDao;
import org.georchestra.ds.users.Account;
import org.georchestra.ds.users.AccountDao;
import org.georchestra.ds.users.ProtectedUserFilter;
import org.georchestra.ds.users.UserRule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/manager")
public class ManagerUsersController {

    private static final GrantedAuthority ROLE_SUPERUSER = new SimpleGrantedAuthority("ROLE_SUPERUSER");
    private static final DateTimeFormatter ISO_DATE = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final SimpleDateFormat LEGACY_DATE = new SimpleDateFormat("yyyy-MM-dd");

    private static final List<String> ADMIN_ROLES = List.of(
            "SUPERUSER",
            "ADMINISTRATOR",
            "GN_ADMIN",
            "GN_EDITOR",
            "GN_REVIEWER",
            "ORGADMIN",
            "MAPSTORE_ADMIN",
            "USER",
            "PENDING",
            "EXPIRED",
            "REFERENT",
            "TEMPORARY",
            "IMPORT");

    private final AccountDao accountDao;
    private final OrgsDao orgDao;
    private final RoleDao roleDao;
    private final AdvancedDelegationDao advancedDelegationDao;
    private final DelegationDao delegationDao;
    private final UserRule userRule;
    private final MessageSource messageSource;

    @Autowired
    public ManagerUsersController(AccountDao accountDao, OrgsDao orgDao, RoleDao roleDao,
            AdvancedDelegationDao advancedDelegationDao, DelegationDao delegationDao, UserRule userRule,
            MessageSource messageSource) {
        this.accountDao = accountDao;
        this.orgDao = orgDao;
        this.roleDao = roleDao;
        this.advancedDelegationDao = advancedDelegationDao;
        this.delegationDao = delegationDao;
        this.userRule = userRule;
        this.messageSource = messageSource;
    }

    @GetMapping("/browse/{scope}/users")
    @PreAuthorize("hasAnyRole('SUPERUSER','ORGADMIN')")
    public String browseUsers(@PathVariable String scope,
            @RequestParam(required = false) String q,
            @RequestParam(required = false, defaultValue = "user") String sort,
            @RequestParam(required = false, defaultValue = "asc") String dir,
            Model model) throws DataServiceException {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean superuser = auth != null && auth.getAuthorities().contains(ROLE_SUPERUSER);

        List<SimpleAccount> visibleUsers = findVisibleUsers(auth, superuser);
        Set<String> visibleUserIds = visibleUsers.stream().map(SimpleAccount::getUid).collect(Collectors.toSet());

        List<Role> roles = roleDao.findAll();
        Map<String, Set<String>> roleUsers = new LinkedHashMap<>();
        for (Role role : roles) {
            roleUsers.put(role.getName(), role.getUserList().stream()
                    .filter(visibleUserIds::contains)
                    .collect(Collectors.toCollection(LinkedHashSet::new)));
        }

        List<RoleEntry> browseRoles = buildBrowseRoles(auth, superuser, roles, visibleUsers, roleUsers);
        Map<String, RoleEntry> browseRolesByCn = browseRoles.stream()
                .collect(Collectors.toMap(RoleEntry::cn, role -> role, (left, right) -> left, LinkedHashMap::new));

        String normalizedScope = normalizeScope(scope, browseRolesByCn);
        List<SimpleAccount> scopedUsers = filterByScope(normalizedScope, visibleUsers, roleUsers);
        List<SimpleAccount> filteredUsers = filterByQuery(scopedUsers, q);
        String normalizedSort = normalizeSort(sort);
        String normalizedDirection = normalizeDirection(dir);
        filteredUsers = sortUsers(filteredUsers, normalizedSort, normalizedDirection);

        model.addAttribute("browseRoles", browseRoles);
        model.addAttribute("scope", normalizedScope);
        model.addAttribute("activeRole", browseRolesByCn.get(normalizedScope));
        model.addAttribute("query", q == null ? "" : q);
        model.addAttribute("sort", normalizedSort);
        model.addAttribute("dir", normalizedDirection);
        model.addAttribute("nextSortDir", "asc".equals(normalizedDirection) ? "desc" : "asc");
        model.addAttribute("users", filteredUsers);
        model.addAttribute("totalUsers", filteredUsers.size());

        return "manager/managerUsers";
    }

    @GetMapping("/users/{uid:.+}/infos")
    @PreAuthorize("hasAnyRole('SUPERUSER','ORGADMIN')")
    public String userInfos(@PathVariable String uid, Model model) throws DataServiceException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean superuser = auth != null && auth.getAuthorities().contains(ROLE_SUPERUSER);

        Account account = findManagedAccount(uid, auth, superuser);
        List<Org> visibleOrgs = findVisibleOrganizations(auth, superuser, account.getOrg());
        Org currentOrg = account.getOrg() == null ? null : orgDao.findByCommonName(account.getOrg());

        model.addAttribute("managedUser", UserInfoView.from(account));
        model.addAttribute("organizations", visibleOrgs.stream()
                .map(org -> new OrgEntry(
                        org.getId(),
                        org.getName(),
                        org.isPending(),
                        org.isPending() ? org.getName() + " (" + resolve("manager.userinfo.org.pending") + ")"
                                : org.getName()))
                .collect(Collectors.toList()));
        model.addAttribute("expired", isExpired(account));
        model.addAttribute("currentOrgPending", currentOrg != null && currentOrg.isPending());
        model.addAttribute("currentOrgName", currentOrg == null ? null : currentOrg.getName());
        model.addAttribute("canEditLogin", !account.getIsExternalAuth());
        model.addAttribute("canConfirm", account.isPending() && (currentOrg == null || !currentOrg.isPending()));

        return "manager/managerUserInfo";
    }

    private List<SimpleAccount> findVisibleUsers(Authentication auth, boolean superuser) throws DataServiceException {
        ProtectedUserFilter protectedUserFilter = new ProtectedUserFilter(userRule.getListUidProtected());
        List<Account> accounts = accountDao.findFilterBy(protectedUserFilter);

        if (!superuser && auth != null) {
            Set<String> delegatedUsers = advancedDelegationDao.findUsersUnderDelegation(auth.getName());
            accounts = accounts.stream()
                    .filter(account -> delegatedUsers.contains(account.getUid()))
                    .collect(Collectors.toList());
        }

        Map<String, String> orgNames = new HashMap<>();
        for (Org org : orgDao.findAll()) {
            orgNames.put(org.getId(), org.getName());
        }

        List<SimpleAccount> result = new ArrayList<>();
        for (Account account : accounts) {
            SimpleAccount simpleAccount = new SimpleAccount(account);
            simpleAccount.setOrgName(orgNames.get(account.getOrg()));
            result.add(simpleAccount);
        }

        result.sort(Comparator
                .comparing(SimpleAccount::getSurname, Comparator.nullsLast(String::compareToIgnoreCase))
                .thenComparing(SimpleAccount::getGivenName, Comparator.nullsLast(String::compareToIgnoreCase))
                .thenComparing(SimpleAccount::getUid, Comparator.nullsLast(String::compareToIgnoreCase)));
        return result;
    }

    private Account findManagedAccount(String uid, Authentication auth, boolean superuser) throws DataServiceException {
        if (userRule.isProtected(uid)) {
            throw new AccessDeniedException("The user is protected: " + uid);
        }
        checkAuthorization(uid, auth, superuser);
        return accountDao.findByUID(uid);
    }

    private List<Org> findVisibleOrganizations(Authentication auth, boolean superuser, String currentOrgId)
            throws DataServiceException {
        List<Org> organizations = new ArrayList<>(orgDao.findAll());
        if (!superuser && auth != null) {
            Set<String> delegatedOrgs = delegatedOrgs(auth);
            organizations = organizations.stream()
                    .filter(org -> delegatedOrgs.contains(org.getId()) || org.getId().equals(currentOrgId))
                    .collect(Collectors.toList());
        }
        organizations.sort(Comparator.comparing(Org::getName, Comparator.nullsLast(String::compareToIgnoreCase)));
        return organizations;
    }

    private List<RoleEntry> buildBrowseRoles(Authentication auth, boolean superuser, List<Role> roles,
            List<SimpleAccount> visibleUsers, Map<String, Set<String>> roleUsers) {
        Set<String> delegatedRoles = delegatedRoles(auth, superuser);

        List<RoleEntry> entries = new ArrayList<>();
        entries.add(new RoleEntry("all", resolve("manager.users.scope.all"),
                resolve("manager.users.scope.all.description"),
                (int) visibleUsers.stream().filter(user -> !user.isPending()).count()));
        entries.add(new RoleEntry("pending", resolve("users.PENDING"),
                resolve("manager.users.scope.pending.description"),
                (int) visibleUsers.stream().filter(SimpleAccount::isPending).count()));

        for (Role role : roles) {
            if (!ADMIN_ROLES.contains(role.getName())) {
                continue;
            }
            if (!superuser && !delegatedRoles.contains(role.getName())) {
                continue;
            }
            entries.add(new RoleEntry(role.getName(), resolve(roleLabelKey(role.getName())), role.getDescription(),
                    roleUsers.getOrDefault(role.getName(), Set.of()).size()));
        }
        return entries;
    }

    private Set<String> delegatedOrgs(Authentication auth) {
        if (auth == null) {
            return Set.of();
        }
        DelegationEntry delegationEntry = delegationDao.findFirstByUid(auth.getName());
        if (delegationEntry == null || delegationEntry.getOrgs() == null) {
            return Set.of();
        }
        return new LinkedHashSet<>(Arrays.asList(delegationEntry.getOrgs()));
    }

    private Set<String> delegatedRoles(Authentication auth, boolean superuser) {
        if (superuser || auth == null) {
            return Set.of();
        }
        DelegationEntry delegationEntry = delegationDao.findFirstByUid(auth.getName());
        if (delegationEntry == null || delegationEntry.getRoles() == null) {
            return Set.of();
        }
        return new LinkedHashSet<>(Arrays.asList(delegationEntry.getRoles()));
    }

    private List<SimpleAccount> filterByScope(String scope, List<SimpleAccount> users, Map<String, Set<String>> roleUsers) {
        if ("pending".equals(scope)) {
            return users.stream().filter(SimpleAccount::isPending).collect(Collectors.toList());
        }
        if ("all".equals(scope)) {
            return users.stream().filter(user -> !user.isPending()).collect(Collectors.toList());
        }

        Set<String> scopedUserIds = roleUsers.getOrDefault(scope, Set.of());
        return users.stream()
                .filter(user -> scopedUserIds.contains(user.getUid()))
                .collect(Collectors.toList());
    }

    private List<SimpleAccount> filterByQuery(List<SimpleAccount> users, String q) {
        if (q == null || q.isBlank()) {
            return users;
        }
        String normalized = q.toLowerCase();
        return users.stream()
                .filter(user -> containsIgnoreCase(user.getSurname(), normalized)
                        || containsIgnoreCase(user.getGivenName(), normalized)
                        || containsIgnoreCase(user.getUid(), normalized)
                        || containsIgnoreCase(user.getOrgName(), normalized)
                        || containsIgnoreCase(user.getEmail(), normalized))
                .collect(Collectors.toList());
    }

    private boolean containsIgnoreCase(String value, String query) {
        return value != null && value.toLowerCase().contains(query);
    }

    private List<SimpleAccount> sortUsers(List<SimpleAccount> users, String sort, String dir) {
        Comparator<String> stringComparator = Comparator.nullsLast(String::compareToIgnoreCase);
        Comparator<SimpleAccount> comparator;

        switch (sort) {
            case "login":
                comparator = Comparator.comparing(SimpleAccount::getUid, stringComparator);
                break;
            case "organization":
                comparator = Comparator.comparing(SimpleAccount::getOrgName, stringComparator)
                        .thenComparing(SimpleAccount::getSurname, stringComparator)
                        .thenComparing(SimpleAccount::getGivenName, stringComparator);
                break;
            case "email":
                comparator = Comparator.comparing(SimpleAccount::getEmail, stringComparator)
                        .thenComparing(SimpleAccount::getSurname, stringComparator)
                        .thenComparing(SimpleAccount::getGivenName, stringComparator);
                break;
            case "user":
            default:
                comparator = Comparator.comparing(SimpleAccount::getSurname, stringComparator)
                        .thenComparing(SimpleAccount::getGivenName, stringComparator)
                        .thenComparing(SimpleAccount::getUid, stringComparator);
                break;
        }

        if ("desc".equals(dir)) {
            comparator = comparator.reversed();
        }

        return users.stream().sorted(comparator).collect(Collectors.toList());
    }

    private String normalizeScope(String scope, Map<String, RoleEntry> browseRolesByCn) {
        if (scope == null || scope.isBlank()) {
            return "all";
        }
        String normalized = scope.toUpperCase();
        if ("all".equalsIgnoreCase(scope) || "pending".equalsIgnoreCase(scope)) {
            return scope.toLowerCase();
        }
        return browseRolesByCn.containsKey(normalized) ? normalized : "all";
    }

    private String normalizeSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return "user";
        }
        return switch (sort) {
            case "login", "organization", "email" -> sort;
            default -> "user";
        };
    }

    private String normalizeDirection(String dir) {
        return "desc".equalsIgnoreCase(dir) ? "desc" : "asc";
    }

    private String roleLabelKey(String roleCn) {
        return "users." + roleCn;
    }

    private String resolve(String key) {
        return messageSource.getMessage(key, null, key, LocaleContextHolder.getLocale());
    }

    private boolean isExpired(Account account) throws DataServiceException {
        return roleDao.findAllForUser(account).stream().anyMatch(role -> "EXPIRED".equals(role.getName()));
    }

    private void checkAuthorization(String uid, Authentication auth, boolean superuser) {
        if (!superuser && auth != null && !advancedDelegationDao.findUsersUnderDelegation(auth.getName()).contains(uid)) {
            throw new AccessDeniedException("User " + uid + " not under delegation");
        }
    }

    public record OrgEntry(String id, String name, boolean pending, String label) {
    }

    public record RoleEntry(String cn, String label, String description, int count) {
    }

    public record UserInfoView(
            String uid,
            String commonName,
            String surname,
            String givenName,
            String email,
            String postalAddress,
            String org,
            String description,
            String manager,
            String shadowExpire,
            String phone,
            String facsimile,
            String title,
            String privacyPolicyAgreementDate,
            String creationDate,
            String lastLogin,
            String note,
            String saslUser,
            String oAuth2Provider,
            boolean externalAuth,
            boolean pending) {

        static UserInfoView from(Account account) {
            return new UserInfoView(
                    account.getUid(),
                    account.getCommonName(),
                    account.getSurname(),
                    account.getGivenName(),
                    account.getEmail(),
                    account.getPostalAddress(),
                    account.getOrg(),
                    account.getDescription(),
                    account.getManager(),
                    account.getShadowExpire() == null ? "" : LEGACY_DATE.format(account.getShadowExpire()),
                    account.getPhone(),
                    account.getFacsimile(),
                    account.getTitle(),
                    account.getPrivacyPolicyAgreementDate() == null ? ""
                            : ISO_DATE.format(account.getPrivacyPolicyAgreementDate()),
                    account.getCreationDate() == null ? "" : ISO_DATE.format(account.getCreationDate()),
                    account.getLastLogin() == null ? "" : ISO_DATE.format(account.getLastLogin()),
                    account.getNote(),
                    account.getSASLUser(),
                    account.getOAuth2Provider(),
                    account.getIsExternalAuth(),
                    account.isPending());
        }
    }
}
