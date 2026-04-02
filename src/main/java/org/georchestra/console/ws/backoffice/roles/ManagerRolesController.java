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
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * geOrchestra. If not, see <http://www.gnu.org/licenses/>.
 */
package org.georchestra.console.ws.backoffice.roles;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Comparator;
import java.util.Date;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.commons.lang3.tuple.Pair;
import org.georchestra.console.dao.AdvancedDelegationDao;
import org.georchestra.console.dao.DelegationDao;
import org.georchestra.console.model.DelegationEntry;
import org.georchestra.ds.DataServiceException;
import org.georchestra.ds.roles.Role;
import org.georchestra.ds.roles.RoleDao;
import org.georchestra.ds.roles.RoleFactory;
import org.georchestra.ds.users.Account;
import org.georchestra.ds.users.AccountDao;
import org.georchestra.ds.users.ProtectedUserFilter;
import org.georchestra.ds.users.UserRule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/manager")
public class ManagerRolesController {

    private static final SimpleGrantedAuthority ROLE_SUPERUSER = new SimpleGrantedAuthority("ROLE_SUPERUSER");
    private static final List<String> READONLY_ROLES = List.of("PENDING", "EXPIRED", "TEMPORARY", "ORGADMIN");
    private static final int USERS_PAGE_SIZE = 15;
    private static final String VIRTUAL_TEMPORARY_ROLE_NAME = "TEMPORARY";
    private static final String VIRTUAL_TEMPORARY_ROLE_DESCRIPTION = "Virtual role that contains all temporary users";
    private static final String VIRTUAL_EXPIRED_ROLE_NAME = "EXPIRED";
    private static final String VIRTUAL_EXPIRED_ROLE_DESCRIPTION = "Virtual role that contains all expired users";

    private final RoleDao roleDao;
    private final AccountDao accountDao;
    private final AdvancedDelegationDao advancedDelegationDao;
    private final DelegationDao delegationDao;
    private final ProtectedUserFilter protectedUserFilter;

    @Autowired
    public ManagerRolesController(RoleDao roleDao, AccountDao accountDao, AdvancedDelegationDao advancedDelegationDao,
            DelegationDao delegationDao, UserRule userRule) {
        this.roleDao = roleDao;
        this.accountDao = accountDao;
        this.advancedDelegationDao = advancedDelegationDao;
        this.delegationDao = delegationDao;
        this.protectedUserFilter = new ProtectedUserFilter(userRule.getListUidProtected());
    }

    @GetMapping("/roles/{scope}")
    @PreAuthorize("hasAnyRole('SUPERUSER','ORGADMIN')")
    public String roles(@PathVariable String scope, @RequestParam(required = false) String q, Model model)
            throws DataServiceException {
        Authentication auth = authentication();
        boolean superuser = isSuperuser(auth);
        String normalizedScope = "all".equalsIgnoreCase(scope) ? "all" : "all";

        List<RoleListEntry> roles = findVisibleRoleEntries(auth, superuser);
        if (q != null && !q.isBlank()) {
            String normalizedQuery = q.toLowerCase();
            roles = roles.stream()
                    .filter(role -> role.cn().toLowerCase().contains(normalizedQuery)
                            || contains(role.description(), normalizedQuery))
                    .collect(Collectors.toList());
        }

        model.addAttribute("scope", normalizedScope);
        model.addAttribute("query", q == null ? "" : q);
        model.addAttribute("roles", roles);
        model.addAttribute("roleCount", roles.size());
        model.addAttribute("isSuperuser", superuser);
        return "manager/managerRoles";
    }

    @GetMapping("/roles/new")
    @PreAuthorize("hasRole('SUPERUSER')")
    public String newRole(Model model) {
        model.addAttribute("role", new RoleForm("", "", false, true));
        model.addAttribute("readonly", false);
        model.addAttribute("creating", true);
        return "manager/managerRoleInfo";
    }

    @GetMapping("/roles/{cn:.+}/infos")
    @PreAuthorize("hasAnyRole('SUPERUSER','ORGADMIN')")
    public String roleInfos(@PathVariable String cn, Model model) throws DataServiceException {
        Authentication auth = authentication();
        boolean superuser = isSuperuser(auth);
        Role role = findManagedRole(cn, auth, superuser);
        populateRoleInfoModel(model, role, false);
        return "manager/managerRoleInfo";
    }

    @GetMapping("/roles/{cn:.+}/users")
    @PreAuthorize("hasAnyRole('SUPERUSER','ORGADMIN')")
    public String roleUsers(@PathVariable String cn,
            @RequestParam(required = false) String q,
            @RequestParam(required = false, defaultValue = "0") int page,
            Model model) throws DataServiceException {
        Authentication auth = authentication();
        boolean superuser = isSuperuser(auth);
        Role role = findManagedRole(cn, auth, superuser);
        List<UserListEntry> visibleUsers = findVisibleUsers(auth, superuser);

        Set<String> currentUserIds = new LinkedHashSet<>(role.getUserList());
        List<UserListEntry> assignedUsers = visibleUsers.stream()
                .filter(user -> currentUserIds.contains(user.uid()))
                .collect(Collectors.toList());
        List<UserListEntry> filteredUsers = filterUsers(assignedUsers, q);
        int currentPage = normalizePage(page, filteredUsers.size(), USERS_PAGE_SIZE);
        List<UserListEntry> pageUsers = paginate(filteredUsers, currentPage, USERS_PAGE_SIZE);
        List<UserListEntry> availableUsers = visibleUsers.stream()
                .filter(user -> !currentUserIds.contains(user.uid()))
                .collect(Collectors.toList());

        populateRoleInfoModel(model, role, false);
        model.addAttribute("query", q == null ? "" : q);
        model.addAttribute("managedUsers", pageUsers);
        model.addAttribute("availableUsers", availableUsers);
        model.addAttribute("totalUsers", filteredUsers.size());
        model.addAttribute("page", currentPage);
        model.addAttribute("pageSize", USERS_PAGE_SIZE);
        model.addAttribute("pageCount", pageCount(filteredUsers.size(), USERS_PAGE_SIZE));
        model.addAttribute("hasPreviousPage", currentPage > 0);
        model.addAttribute("hasNextPage", currentPage + 1 < pageCount(filteredUsers.size(), USERS_PAGE_SIZE));
        return "manager/managerRoleUsers";
    }

    @GetMapping("/roles/{cn:.+}/manage")
    @PreAuthorize("hasAnyRole('SUPERUSER','ORGADMIN')")
    public String roleManage(@PathVariable String cn, Model model) throws DataServiceException {
        Authentication auth = authentication();
        boolean superuser = isSuperuser(auth);
        Role role = findManagedRole(cn, auth, superuser);
        populateRoleInfoModel(model, role, false);
        return "manager/managerRoleManage";
    }

    private void populateRoleInfoModel(Model model, Role role, boolean creating) {
        boolean readonly = READONLY_ROLES.contains(role.getName());
        model.addAttribute("role", new RoleForm(role.getName(), role.getDescription(), role.isFavorite(), readonly));
        model.addAttribute("readonly", readonly);
        model.addAttribute("creating", creating);
        model.addAttribute("roleMembersCount", role.getUserList().size());
    }

    private Role findManagedRole(String cn, Authentication auth, boolean superuser) throws DataServiceException {
        Role role = VIRTUAL_TEMPORARY_ROLE_NAME.equals(cn) ? generateVirtualRoles().getLeft()
                : VIRTUAL_EXPIRED_ROLE_NAME.equals(cn) ? generateVirtualRoles().getRight()
                        : roleDao.findByCommonName(cn);
        role.setUserList(protectedUserFilter.filterStringList(role.getUserList()));
        if (!superuser) {
            Set<String> delegatedRoles = delegatedRoles(auth, false);
            if (!delegatedRoles.contains(role.getName())) {
                throw new AccessDeniedException("Role not under delegation: " + cn);
            }
            Set<String> delegatedUsers = delegatedUsers(auth, false);
            role.setUserList(role.getUserList().stream().filter(delegatedUsers::contains).collect(Collectors.toList()));
        }
        return role;
    }

    private List<RoleListEntry> findVisibleRoleEntries(Authentication auth, boolean superuser) throws DataServiceException {
        return findVisibleRoles(auth, superuser).stream()
                .map(role -> new RoleListEntry(
                        role.getName(),
                        role.getDescription(),
                        role.isFavorite(),
                        role.getUserList().size(),
                        READONLY_ROLES.contains(role.getName())))
                .sorted(Comparator.comparing(RoleListEntry::cn, String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());
    }

    private List<Role> findVisibleRoles(Authentication auth, boolean superuser) throws DataServiceException {
        Set<String> delegatedRoles = delegatedRoles(auth, superuser);
        Set<String> delegatedUsers = delegatedUsers(auth, superuser);

        List<Role> roles = new ArrayList<>(roleDao.findAll());
        roles.forEach(role -> role.setUserList(protectedUserFilter.filterStringList(role.getUserList())));
        Pair<Role, Role> virtualRoles = generateVirtualRoles();
        roles.addAll(Arrays.asList(virtualRoles.getLeft(), virtualRoles.getRight()));

        List<Role> result = new ArrayList<>();
        for (Role role : roles) {
            if (!superuser && !delegatedRoles.contains(role.getName())) {
                continue;
            }
            if (!superuser) {
                role.setUserList(role.getUserList().stream().filter(delegatedUsers::contains).collect(Collectors.toList()));
            }
            result.add(role);
        }
        result.sort(Comparator.comparing(Role::getName, String.CASE_INSENSITIVE_ORDER));
        return result;
    }

    private List<UserListEntry> findVisibleUsers(Authentication auth, boolean superuser) throws DataServiceException {
        List<Account> accounts = accountDao.findFilterBy(protectedUserFilter);
        if (!superuser && auth != null) {
            Set<String> delegatedUsers = delegatedUsers(auth, false);
            accounts = accounts.stream()
                    .filter(account -> delegatedUsers.contains(account.getUid()))
                    .collect(Collectors.toList());
        }
        return accounts.stream()
                .map(UserListEntry::from)
                .sorted(Comparator.comparing(UserListEntry::sortKey, String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());
    }

    private List<UserListEntry> filterUsers(List<UserListEntry> users, String query) {
        if (query == null || query.isBlank()) {
            return users;
        }
        String normalizedQuery = query.toLowerCase();
        return users.stream()
                .filter(user -> user.uid().toLowerCase().contains(normalizedQuery)
                        || user.displayName().toLowerCase().contains(normalizedQuery))
                .collect(Collectors.toList());
    }

    private <T> List<T> paginate(List<T> values, int page, int pageSize) {
        int fromIndex = Math.min(page * pageSize, values.size());
        int toIndex = Math.min(fromIndex + pageSize, values.size());
        return values.subList(fromIndex, toIndex);
    }

    private int normalizePage(int page, int total, int pageSize) {
        int pageCount = pageCount(total, pageSize);
        if (page < 0) {
            return 0;
        }
        if (pageCount == 0) {
            return 0;
        }
        return Math.min(page, pageCount - 1);
    }

    private int pageCount(int total, int pageSize) {
        if (total <= 0) {
            return 0;
        }
        return (total + pageSize - 1) / pageSize;
    }

    private boolean isSuperuser(Authentication auth) {
        return auth != null && auth.getAuthorities().contains(ROLE_SUPERUSER);
    }

    private Authentication authentication() {
        return SecurityContextHolder.getContext().getAuthentication();
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

    private Set<String> delegatedUsers(Authentication auth, boolean superuser) {
        if (superuser || auth == null) {
            return Set.of();
        }
        return advancedDelegationDao.findUsersUnderDelegation(auth.getName());
    }

    private Pair<Role, Role> generateVirtualRoles() throws DataServiceException {
        Role temporaryRole = RoleFactory.create(VIRTUAL_TEMPORARY_ROLE_NAME, VIRTUAL_TEMPORARY_ROLE_DESCRIPTION, false);
        Role expiredRole = RoleFactory.create(VIRTUAL_EXPIRED_ROLE_NAME, VIRTUAL_EXPIRED_ROLE_DESCRIPTION, false);
        Date today = Calendar.getInstance().getTime();
        accountDao.findByShadowExpire().forEach(account -> {
            if (account.getShadowExpire() != null && today.after(account.getShadowExpire())) {
                expiredRole.addUser(account.getUid());
            }
            temporaryRole.addUser(account.getUid());
        });
        temporaryRole.setUserList(protectedUserFilter.filterStringList(temporaryRole.getUserList()));
        expiredRole.setUserList(protectedUserFilter.filterStringList(expiredRole.getUserList()));
        return Pair.of(temporaryRole, expiredRole);
    }

    private boolean contains(String value, String query) {
        return value != null && value.toLowerCase().contains(query);
    }

    public record RoleListEntry(String cn, String description, boolean favorite, int usersCount, boolean readonly) {
    }

    public record RoleForm(String cn, String description, boolean favorite, boolean readonly) {
    }

    public record UserListEntry(String uid, String displayName) {
        static UserListEntry from(Account account) {
            String givenName = account.getGivenName() == null ? "" : account.getGivenName();
            String surname = account.getSurname() == null ? "" : account.getSurname();
            String fullName = (surname + " " + givenName).trim();
            return new UserListEntry(account.getUid(), fullName.isEmpty() ? account.getUid() : fullName);
        }

        String sortKey() {
            return displayName + " " + uid;
        }
    }
}
