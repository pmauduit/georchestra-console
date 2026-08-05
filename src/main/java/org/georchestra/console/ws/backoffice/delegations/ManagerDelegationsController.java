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
package org.georchestra.console.ws.backoffice.delegations;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.servlet.http.HttpServletRequest;

import org.georchestra.console.dao.DelegationDao;
import org.georchestra.console.model.DelegationEntry;
import org.georchestra.ds.orgs.Org;
import org.georchestra.ds.orgs.OrgsDao;
import org.georchestra.ds.roles.Role;
import org.georchestra.ds.roles.RoleDao;
import org.georchestra.ds.users.Account;
import org.georchestra.ds.users.AccountDao;
import org.georchestra.ds.users.ProtectedUserFilter;
import org.georchestra.ds.users.UserRule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/manager")
public class ManagerDelegationsController {

    private static final int PAGE_SIZE = 15;
    private static final Set<String> EXCLUDED_DELEGATION_ROLES = Set.of("ORGADMIN", "PENDING", "EXPIRED", "TEMPORARY");

    private final DelegationDao delegationDao;
    private final OrgsDao orgDao;
    private final RoleDao roleDao;
    private final AccountDao accountDao;
    private final ProtectedUserFilter protectedUserFilter;

    @Autowired
    public ManagerDelegationsController(DelegationDao delegationDao, OrgsDao orgDao, RoleDao roleDao,
            AccountDao accountDao, UserRule userRule) {
        this.delegationDao = delegationDao;
        this.orgDao = orgDao;
        this.roleDao = roleDao;
        this.accountDao = accountDao;
        this.protectedUserFilter = new ProtectedUserFilter(userRule.getListUidProtected());
    }

    @GetMapping("/delegations")
    @PreAuthorize("hasRole('SUPERUSER')")
    public String delegations(@RequestParam(required = false) String q,
            @RequestParam(required = false, defaultValue = "0") int page,
            Model model) {
        Map<String, Org> organizationsById = new LinkedHashMap<>();
        orgDao.findAll().forEach(org -> organizationsById.put(org.getId(), org));

        List<DelegationListEntry> delegations = new ArrayList<>();
        for (DelegationEntry delegation : delegationDao.findAll()) {
            List<DelegationOrgEntry> orgs = Arrays.stream(nullToEmpty(delegation.getOrgs()))
                    .map(orgId -> {
                        Org org = organizationsById.get(orgId);
                        String name = org == null ? orgId : org.getName();
                        return new DelegationOrgEntry(orgId, name);
                    })
                    .sorted(Comparator.comparing(DelegationOrgEntry::name, String.CASE_INSENSITIVE_ORDER))
                    .collect(Collectors.toList());

            List<String> roles = Arrays.stream(nullToEmpty(delegation.getRoles()))
                    .sorted(String.CASE_INSENSITIVE_ORDER)
                    .collect(Collectors.toList());

            delegations.add(new DelegationListEntry(
                    delegation.getUid(),
                    orgs,
                    roles,
                    orgs.stream().map(DelegationOrgEntry::name).collect(Collectors.joining(", ")),
                    String.join(", ", roles)));
        }

        delegations.sort(Comparator.comparing(DelegationListEntry::uid, String.CASE_INSENSITIVE_ORDER));

        List<DelegationListEntry> filteredDelegations = filterDelegations(delegations, q);
        int currentPage = normalizePage(page, filteredDelegations.size(), PAGE_SIZE);
        List<DelegationListEntry> pageDelegations = paginate(filteredDelegations, currentPage, PAGE_SIZE);

        model.addAttribute("query", q == null ? "" : q);
        model.addAttribute("delegations", pageDelegations);
        model.addAttribute("totalDelegations", filteredDelegations.size());
        model.addAttribute("page", currentPage);
        model.addAttribute("pageCount", pageCount(filteredDelegations.size(), PAGE_SIZE));
        model.addAttribute("hasPreviousPage", currentPage > 0);
        model.addAttribute("hasNextPage", currentPage + 1 < pageCount(filteredDelegations.size(), PAGE_SIZE));
        return "manager/managerDelegations";
    }

    @GetMapping("/delegations/new")
    @PreAuthorize("hasRole('SUPERUSER')")
    public String newDelegation(Model model, HttpServletRequest request) throws org.georchestra.ds.DataServiceException {
        populateDelegationFormModel(model, new DelegationForm("", List.of(), List.of()), true);
        configureDelegationNavigation(model, false, null, request.getContextPath() + "/manager/delegations");
        model.addAttribute("hasDelegation", false);
        return "manager/managerDelegationForm";
    }

    @GetMapping("/delegations/{uid:.+}")
    @PreAuthorize("hasRole('SUPERUSER')")
    public String delegation(@PathVariable String uid, Model model, HttpServletRequest request)
            throws org.georchestra.ds.DataServiceException {
        DelegationEntry delegation = delegationDao.findFirstByUid(uid);
        DelegationForm form = delegation == null
                ? new DelegationForm(uid, List.of(), List.of())
                : new DelegationForm(
                        delegation.getUid(),
                        Arrays.asList(nullToEmpty(delegation.getOrgs())),
                        Arrays.asList(nullToEmpty(delegation.getRoles())));
        populateDelegationFormModel(model, form, false);
        configureDelegationNavigation(model, false, null, request.getContextPath() + "/manager/delegations");
        model.addAttribute("hasDelegation", delegation != null);
        return "manager/managerDelegationForm";
    }

    @GetMapping("/users/{uid:.+}/delegation")
    @PreAuthorize("hasRole('SUPERUSER')")
    public String userDelegation(@PathVariable String uid, Model model, HttpServletRequest request)
            throws org.georchestra.ds.DataServiceException {
        Account managedUser = accountDao.findByUID(uid);
        DelegationEntry delegation = delegationDao.findFirstByUid(uid);
        DelegationForm form = delegation == null
                ? new DelegationForm(uid, List.of(), List.of())
                : new DelegationForm(
                        delegation.getUid(),
                        Arrays.asList(nullToEmpty(delegation.getOrgs())),
                        Arrays.asList(nullToEmpty(delegation.getRoles())));
        populateDelegationFormModel(model, form, false);
        configureDelegationNavigation(model, true, managedUser,
                request.getContextPath() + "/manager/users/" + uid + "/infos");
        model.addAttribute("hasDelegation", delegation != null);
        return "manager/managerDelegationForm";
    }

    private void populateDelegationFormModel(Model model, DelegationForm form, boolean creating)
            throws org.georchestra.ds.DataServiceException {
        List<UserOption> users = accountDao.findFilterBy(protectedUserFilter).stream()
                .sorted(Comparator.comparing(Account::getUid, String.CASE_INSENSITIVE_ORDER))
                .map(account -> new UserOption(
                        account.getUid(),
                        account.getCommonName() == null || account.getCommonName().isBlank()
                                ? account.getUid()
                                : account.getCommonName() + " (" + account.getUid() + ")"))
                .collect(Collectors.toList());

        List<DelegationOrgOption> organizations = orgDao.findAll().stream()
                .sorted(Comparator.comparing(Org::getName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                .map(org -> new DelegationOrgOption(org.getId(), org.getName()))
                .collect(Collectors.toList());

        List<RoleOption> roles = roleDao.findAll().stream()
                .map(Role::getName)
                .filter(role -> !EXCLUDED_DELEGATION_ROLES.contains(role))
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .map(role -> new RoleOption(role, role))
                .collect(Collectors.toList());

        model.addAttribute("delegation", form);
        model.addAttribute("creating", creating);
        model.addAttribute("users", users);
        model.addAttribute("organizations", organizations);
        model.addAttribute("roles", roles);
    }

    private void configureDelegationNavigation(Model model, boolean userScoped, Account managedUser, String returnUrl) {
        model.addAttribute("userScoped", userScoped);
        model.addAttribute("managedUser", managedUser);
        model.addAttribute("returnUrl", returnUrl);
    }

    private List<DelegationListEntry> filterDelegations(List<DelegationListEntry> delegations, String query) {
        if (query == null || query.isBlank()) {
            return delegations;
        }
        String normalizedQuery = query.toLowerCase();
        return delegations.stream()
                .filter(delegation -> contains(delegation.uid(), normalizedQuery)
                        || contains(delegation.orgNames(), normalizedQuery)
                        || contains(delegation.roleNames(), normalizedQuery))
                .collect(Collectors.toList());
    }

    private boolean contains(String value, String query) {
        return value != null && value.toLowerCase().contains(query);
    }

    private String[] nullToEmpty(String[] values) {
        return values == null ? new String[0] : values;
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

    public record DelegationListEntry(
            String uid,
            List<DelegationOrgEntry> orgs,
            List<String> roles,
            String orgNames,
            String roleNames) {
    }

    public record DelegationOrgEntry(String id, String name) {
    }

    public record DelegationForm(String uid, List<String> orgs, List<String> roles) {
    }

    public record UserOption(String uid, String label) {
    }

    public record DelegationOrgOption(String id, String name) {
    }

    public record RoleOption(String name, String label) {
    }
}
