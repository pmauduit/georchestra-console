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
package org.georchestra.console.ws.backoffice.orgs;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.georchestra.console.dao.AdvancedDelegationDao;
import org.georchestra.console.dao.DelegationDao;
import org.georchestra.console.model.DelegationEntry;
import org.georchestra.ds.DataServiceException;
import org.georchestra.ds.orgs.Org;
import org.georchestra.ds.orgs.OrgsDao;
import org.georchestra.ds.users.Account;
import org.georchestra.ds.users.AccountDao;
import org.georchestra.ds.users.ProtectedUserFilter;
import org.georchestra.ds.users.UserRule;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/manager")
public class ManagerOrgsController {

    private static final SimpleGrantedAuthority ROLE_SUPERUSER = new SimpleGrantedAuthority("ROLE_SUPERUSER");
    private static final int USERS_PAGE_SIZE = 15;

    private final OrgsDao orgDao;
    private final DelegationDao delegationDao;
    private final AdvancedDelegationDao advancedDelegationDao;
    private final AccountDao accountDao;
    private final ProtectedUserFilter protectedUserFilter;
    @Value("${competenceAreaEnabled:false}")
    private boolean competenceAreaEnabled;

    @Autowired
    public ManagerOrgsController(OrgsDao orgDao, DelegationDao delegationDao, AdvancedDelegationDao advancedDelegationDao,
            AccountDao accountDao, UserRule userRule) {
        this.orgDao = orgDao;
        this.delegationDao = delegationDao;
        this.advancedDelegationDao = advancedDelegationDao;
        this.accountDao = accountDao;
        this.protectedUserFilter = new ProtectedUserFilter(userRule.getListUidProtected());
    }

    @GetMapping({ "/orgs", "/orgs/", "/orgs/{scope}" })
    @PreAuthorize("hasAnyRole('SUPERUSER','ORGADMIN')")
    public String orgs(@PathVariable(required = false) String scope,
            @RequestParam(required = false) String q,
            @RequestParam(name = "new", required = false) String newOrg,
            @RequestParam(required = false, defaultValue = "name") String sort,
            @RequestParam(required = false, defaultValue = "asc") String dir,
            Model model) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean superuser = auth != null && auth.getAuthorities().contains(ROLE_SUPERUSER);
        if (superuser && "org".equals(newOrg)) {
            return "redirect:/manager/orgs/new";
        }
        String normalizedScope = "pending".equalsIgnoreCase(scope) ? "pending" : "all";

        List<OrgListEntry> visibleOrgs = findVisibleOrganizations(auth, superuser);
        long allCount = visibleOrgs.stream().filter(org -> !org.pending()).count();
        long pendingCount = visibleOrgs.stream().filter(OrgListEntry::pending).count();

        List<OrgListEntry> scopedOrgs = "pending".equals(normalizedScope)
                ? visibleOrgs.stream().filter(OrgListEntry::pending).collect(Collectors.toList())
                : visibleOrgs.stream().filter(org -> !org.pending()).collect(Collectors.toList());

        if (q != null && !q.isBlank()) {
            String query = q.toLowerCase();
            scopedOrgs = scopedOrgs.stream()
                    .filter(org -> contains(org.name(), query)
                            || contains(org.shortName(), query)
                            || contains(org.orgUniqueId(), query))
                    .collect(Collectors.toList());
        }
        String normalizedSort = normalizeSort(sort);
        String normalizedDirection = normalizeDirection(dir);
        scopedOrgs = sortOrganizations(scopedOrgs, normalizedSort, normalizedDirection);

        model.addAttribute("scope", normalizedScope);
        model.addAttribute("query", q == null ? "" : q);
        model.addAttribute("sort", normalizedSort);
        model.addAttribute("dir", normalizedDirection);
        model.addAttribute("nextSortDir", "asc".equals(normalizedDirection) ? "desc" : "asc");
        model.addAttribute("organizations", scopedOrgs);
        model.addAttribute("orgCount", scopedOrgs.size());
        model.addAttribute("allCount", allCount);
        model.addAttribute("pendingCount", pendingCount);
        model.addAttribute("isSuperuser", superuser);
        return "manager/managerOrgs";
    }

    @GetMapping("/orgs/new")
    @PreAuthorize("hasRole('SUPERUSER')")
    public String newOrg(Model model) {
        List<String> orgTypeValues = Arrays.stream(orgDao.getOrgTypeValues())
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .collect(Collectors.toList());
        model.addAttribute("managedOrg", OrgInfoView.blank());
        model.addAttribute("orgTypeValues", orgTypeValues);
        model.addAttribute("delegations", List.of());
        model.addAttribute("isSuperuser", true);
        model.addAttribute("creating", true);
        model.addAttribute("competenceAreaEnabled", competenceAreaEnabled);
        model.addAttribute("managedOrgCitiesCsv", "");
        return "manager/managerOrgInfo";
    }

    @GetMapping("/org/{id:.+}/infos")
    @PreAuthorize("hasAnyRole('SUPERUSER','ORGADMIN')")
    public String orgInfos(@PathVariable String id, Model model) throws SQLException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean superuser = auth != null && auth.getAuthorities().contains(ROLE_SUPERUSER);
        Org org = findManagedOrganization(id, auth, superuser);

        List<String> orgTypeValues = Arrays.stream(orgDao.getOrgTypeValues())
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .collect(Collectors.toList());
        List<DelegationSummary> delegations = superuser
                ? advancedDelegationDao.findByOrg(id).stream()
                        .map(delegation -> new DelegationSummary(delegation.getUid()))
                        .collect(Collectors.toList())
                : List.of();

        model.addAttribute("managedOrg", OrgInfoView.from(org));
        model.addAttribute("orgTypeValues", orgTypeValues);
        model.addAttribute("delegations", delegations);
        model.addAttribute("isSuperuser", superuser);
        model.addAttribute("creating", false);
        model.addAttribute("competenceAreaEnabled", competenceAreaEnabled);
        model.addAttribute("managedOrgCitiesCsv", toCsv(org.getCities()));
        return "manager/managerOrgInfo";
    }

    @GetMapping("/org/{id:.+}/users")
    @PreAuthorize("hasAnyRole('SUPERUSER','ORGADMIN')")
    public String orgUsers(@PathVariable String id,
            @RequestParam(required = false) String q,
            @RequestParam(required = false, defaultValue = "0") int page,
            Model model) throws SQLException, DataServiceException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean superuser = auth != null && auth.getAuthorities().contains(ROLE_SUPERUSER);
        Org org = findManagedOrganization(id, auth, superuser);

        List<UserListEntry> visibleUsers = findVisibleUsers(auth, superuser);
        List<UserListEntry> assignedUsers = visibleUsers.stream()
                .filter(user -> id.equals(user.orgId()))
                .collect(Collectors.toList());
        List<UserListEntry> filteredUsers = filterUsers(assignedUsers, q);
        int currentPage = normalizePage(page, filteredUsers.size(), USERS_PAGE_SIZE);
        List<UserListEntry> pageUsers = paginate(filteredUsers, currentPage, USERS_PAGE_SIZE);
        List<UserListEntry> availableUsers = visibleUsers.stream()
                .filter(user -> !id.equals(user.orgId()))
                .collect(Collectors.toList());

        model.addAttribute("managedOrg", OrgInfoView.from(org));
        model.addAttribute("managedUsers", pageUsers);
        model.addAttribute("availableUsers", availableUsers);
        model.addAttribute("query", q == null ? "" : q);
        model.addAttribute("totalUsers", filteredUsers.size());
        model.addAttribute("page", currentPage);
        model.addAttribute("pageCount", pageCount(filteredUsers.size(), USERS_PAGE_SIZE));
        model.addAttribute("hasPreviousPage", currentPage > 0);
        model.addAttribute("hasNextPage", currentPage + 1 < pageCount(filteredUsers.size(), USERS_PAGE_SIZE));
        return "manager/managerOrgUsers";
    }

    @GetMapping("/org/{id:.+}/manage")
    @PreAuthorize("hasAnyRole('SUPERUSER','ORGADMIN')")
    public String orgManage(@PathVariable String id, Model model) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean superuser = auth != null && auth.getAuthorities().contains(ROLE_SUPERUSER);
        Org org = findManagedOrganization(id, auth, superuser);
        model.addAttribute("managedOrg", OrgInfoView.from(org));
        return "manager/managerOrgManage";
    }

    private Org findManagedOrganization(String id, Authentication auth, boolean superuser) {
        if (!superuser && auth != null && !delegatedOrgs(auth).contains(id)) {
            throw new AccessDeniedException("Organization not under delegation: " + id);
        }
        return orgDao.findByCommonName(id);
    }

    private List<UserListEntry> findVisibleUsers(Authentication auth, boolean superuser) throws DataServiceException {
        List<Account> accounts = accountDao.findFilterBy(protectedUserFilter);
        if (!superuser && auth != null) {
            Set<String> delegatedUsers = advancedDelegationDao.findUsersUnderDelegation(auth.getName());
            accounts = accounts.stream()
                    .filter(account -> delegatedUsers.contains(account.getUid()))
                    .collect(Collectors.toList());
        }
        return accounts.stream()
                .map(UserListEntry::from)
                .sorted(Comparator.comparing(UserListEntry::sortKey, String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());
    }

    private List<OrgListEntry> findVisibleOrganizations(Authentication auth, boolean superuser) {
        List<Org> organizations = new ArrayList<>(orgDao.findAll());
        if (!superuser && auth != null) {
            Set<String> delegatedOrgs = delegatedOrgs(auth);
            organizations = organizations.stream()
                    .filter(org -> delegatedOrgs.contains(org.getId()))
                    .collect(Collectors.toList());
        }
        return organizations.stream()
                .sorted(Comparator.comparing(Org::getName, Comparator.nullsLast(String::compareToIgnoreCase)))
                .map(org -> new OrgListEntry(
                        org.getId(),
                        org.getName(),
                        org.getShortName(),
                        org.getMembers() == null ? 0 : org.getMembers().size(),
                        org.isPending(),
                        org.getOrgUniqueId()))
                .collect(Collectors.toList());
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

    private boolean contains(String value, String query) {
        return value != null && value.toLowerCase().contains(query);
    }

    private String toCsv(List<String> values) {
        if (values == null || values.isEmpty()) {
            return "";
        }
        return String.join(",", values);
    }

    private List<OrgListEntry> sortOrganizations(List<OrgListEntry> organizations, String sort, String dir) {
        Comparator<OrgListEntry> comparator = switch (sort) {
        case "shortName" -> Comparator.comparing(OrgListEntry::shortName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
        case "membersCount" -> Comparator.comparingInt(OrgListEntry::membersCount);
        default -> Comparator.comparing(OrgListEntry::name, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
        };
        if ("desc".equals(dir)) {
            comparator = comparator.reversed();
        }
        return organizations.stream().sorted(comparator).collect(Collectors.toList());
    }

    private String normalizeSort(String sort) {
        return switch (sort) {
        case "shortName", "membersCount" -> sort;
        default -> "name";
        };
    }

    private String normalizeDirection(String dir) {
        return "desc".equalsIgnoreCase(dir) ? "desc" : "asc";
    }

    private List<UserListEntry> filterUsers(List<UserListEntry> users, String query) {
        if (query == null || query.isBlank()) {
            return users;
        }
        String normalizedQuery = query.toLowerCase();
        return users.stream()
                .filter(user -> contains(user.uid(), normalizedQuery)
                        || contains(user.displayName(), normalizedQuery))
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

    public record OrgListEntry(
            String id,
            String name,
            String shortName,
            int membersCount,
            boolean pending,
            String orgUniqueId) {
    }

    public record OrgInfoView(
            String id,
            String name,
            String shortName,
            String orgType,
            String address,
            String description,
            String note,
            String url,
            String mail,
            String orgUniqueId,
            List<String> cities,
            boolean pending,
            int membersCount) {
        static OrgInfoView from(Org org) {
            return new OrgInfoView(
                    org.getId(),
                    org.getName(),
                    org.getShortName(),
                    org.getOrgType(),
                    org.getAddress(),
                    org.getDescription(),
                    org.getNote(),
                    org.getUrl(),
                    org.getMail(),
                    org.getOrgUniqueId(),
                    org.getCities() == null ? List.of() : List.copyOf(org.getCities()),
                    org.isPending(),
                    org.getMembers() == null ? 0 : org.getMembers().size());
        }

        static OrgInfoView blank() {
            return new OrgInfoView("", "", "", "", "", "", "", "", "", "", List.of(), false, 0);
        }
    }

    public record DelegationSummary(String uid) {
    }

    public record UserListEntry(String uid, String displayName, String orgId) {
        static UserListEntry from(Account account) {
            String givenName = account.getGivenName() == null ? "" : account.getGivenName();
            String surname = account.getSurname() == null ? "" : account.getSurname();
            String fullName = (surname + " " + givenName).trim();
            return new UserListEntry(account.getUid(), fullName.isEmpty() ? account.getUid() : fullName, account.getOrg());
        }

        String sortKey() {
            return displayName + " " + uid;
        }
    }
}
