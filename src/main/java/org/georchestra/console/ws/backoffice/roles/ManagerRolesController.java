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
import org.georchestra.ds.users.AccountDao;
import org.georchestra.ds.users.ProtectedUserFilter;
import org.georchestra.ds.users.UserRule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
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
    private static final String VIRTUAL_TEMPORARY_ROLE_NAME = "TEMPORARY";
    private static final String VIRTUAL_TEMPORARY_ROLE_DESCRIPTION = "Virtual role that contains all temporary users";
    private static final String VIRTUAL_EXPIRED_ROLE_NAME = "EXPIRED";
    private static final String VIRTUAL_EXPIRED_ROLE_DESCRIPTION = "Virtual role that contains all expired users";

    private final RoleDao roleDao;
    private final AccountDao accountDao;
    private final AdvancedDelegationDao advancedDelegationDao;
    private final DelegationDao delegationDao;
    private final ProtectedUserFilter protectedUserFilter;
    private final MessageSource messageSource;

    @Autowired
    public ManagerRolesController(RoleDao roleDao, AccountDao accountDao, AdvancedDelegationDao advancedDelegationDao,
            DelegationDao delegationDao, UserRule userRule, MessageSource messageSource) {
        this.roleDao = roleDao;
        this.accountDao = accountDao;
        this.advancedDelegationDao = advancedDelegationDao;
        this.delegationDao = delegationDao;
        this.protectedUserFilter = new ProtectedUserFilter(userRule.getListUidProtected());
        this.messageSource = messageSource;
    }

    @GetMapping("/roles/{scope}")
    @PreAuthorize("hasAnyRole('SUPERUSER','ORGADMIN')")
    public String roles(@PathVariable String scope, @RequestParam(required = false) String q, Model model)
            throws DataServiceException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean superuser = auth != null && auth.getAuthorities().contains(ROLE_SUPERUSER);
        String normalizedScope = "all".equalsIgnoreCase(scope) ? "all" : "all";

        List<RoleListEntry> roles = findVisibleRoles(auth, superuser);
        if (q != null && !q.isBlank()) {
            String normalizedQuery = q.toLowerCase(LocaleContextHolder.getLocale());
            roles = roles.stream()
                    .filter(role -> role.cn().toLowerCase(LocaleContextHolder.getLocale()).contains(normalizedQuery))
                    .collect(Collectors.toList());
        }

        model.addAttribute("scope", normalizedScope);
        model.addAttribute("query", q == null ? "" : q);
        model.addAttribute("roles", roles);
        model.addAttribute("roleCount", roles.size());
        model.addAttribute("isSuperuser", superuser);
        return "manager/managerRoles";
    }

    private List<RoleListEntry> findVisibleRoles(Authentication auth, boolean superuser) throws DataServiceException {
        Set<String> delegatedRoles = delegatedRoles(auth, superuser);
        Set<String> delegatedUsers = delegatedUsers(auth, superuser);

        List<Role> roles = new ArrayList<>(roleDao.findAll());
        roles.forEach(role -> role.setUserList(protectedUserFilter.filterStringList(role.getUserList())));
        Pair<Role, Role> virtualRoles = generateVirtualRoles();
        roles.addAll(Arrays.asList(virtualRoles.getLeft(), virtualRoles.getRight()));

        List<RoleListEntry> entries = new ArrayList<>();
        for (Role role : roles) {
            if (!superuser && !delegatedRoles.contains(role.getName())) {
                continue;
            }
            List<String> users = role.getUserList();
            if (!superuser) {
                users = users.stream().filter(delegatedUsers::contains).collect(Collectors.toList());
            }
            entries.add(new RoleListEntry(
                    role.getName(),
                    role.getDescription(),
                    role.isFavorite(),
                    users.size(),
                    READONLY_ROLES.contains(role.getName())));
        }
        entries.sort(Comparator.comparing(RoleListEntry::cn, String::compareToIgnoreCase));
        return entries;
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

    private String resolve(String key) {
        return messageSource.getMessage(key, null, key, LocaleContextHolder.getLocale());
    }

    public record RoleListEntry(String cn, String description, boolean favorite, int usersCount, boolean readonly) {
        public String translatedCn() {
            return cn;
        }

        public String translatedLabel() {
            return cn;
        }
    }
}
