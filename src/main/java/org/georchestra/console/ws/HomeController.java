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

package org.georchestra.console.ws;

import static org.georchestra.commons.security.SecurityHeaders.SEC_ROLES;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.georchestra.commons.security.SecurityHeaders;
import org.georchestra.console.bs.ExpiredTokenManagement;
import org.georchestra.console.dao.AdminLogDao;
import org.georchestra.console.dao.AdvancedDelegationDao;
import org.georchestra.console.dao.DelegationDao;
import org.georchestra.console.model.AdminLogEntry;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Displays the home page, also intercepts some assets.
 *
 *
 * @author Mauricio Pazos, Pierre Mauduit
 *
 */
@Controller
@RequiredArgsConstructor
public class HomeController {

    private static final Log LOG = LogFactory.getLog(HomeController.class.getName());
    private static final SimpleGrantedAuthority ROLE_SUPERUSER = new SimpleGrantedAuthority("ROLE_SUPERUSER");
    private final ExpiredTokenManagement tokenManagement;
    private final AccountDao accountDao;
    private final OrgsDao orgDao;
    private final RoleDao roleDao;
    private final DelegationDao delegationDao;
    private final AdvancedDelegationDao advancedDelegationDao;
    private final AdminLogDao logDao;
    private final UserRule userRule;

    @Value("${publicContextPath:/console}")
    private String publicContextPath;

    private final ServletContext context;

    @RequestMapping(value = "/")
    public void root(HttpServletRequest request, HttpServletResponse response) throws IOException {

        String roles = SecurityHeaders.decode(request.getHeader(SEC_ROLES));

        if (roles != null) {
            String redirectUrl;
            List<String> rolesList = Arrays.asList(roles.split(";"));

            if (rolesList.contains("ROLE_SUPERUSER") || rolesList.contains("ROLE_ORGADMIN")) {
                redirectUrl = "/manager";
            } else {
                redirectUrl = "/account/userdetails";
            }
            if (LOG.isDebugEnabled()) {
                LOG.debug("root page request -> redirection to " + publicContextPath + redirectUrl);
            }
            response.sendRedirect(publicContextPath + redirectUrl);
        } else {
            // redirect to CAS
            response.sendRedirect(publicContextPath + "/account/userdetails");
        }
    }

    @RequestMapping(value = { "/manager", "/manager/", "/manager/home" })
    @PreAuthorize("hasAnyRole('SUPERUSER','ORGADMIN')")
    public String consoleHome(HttpServletRequest request, Model model) throws IOException, DataServiceException, SQLException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean superuser = auth != null && auth.getAuthorities().contains(ROLE_SUPERUSER);

        ProtectedUserFilter protectedUserFilter = new ProtectedUserFilter(userRule.getListUidProtected());
        List<Account> users = accountDao.findFilterBy(protectedUserFilter);
        List<Org> organizations = new ArrayList<>(orgDao.findAll());
        List<Role> roles = new ArrayList<>(roleDao.findAll());

        if (!superuser && auth != null) {
            Set<String> delegatedUsers = advancedDelegationDao.findUsersUnderDelegation(auth.getName());
            Set<String> delegatedOrgs = delegatedOrgs(auth.getName());
            Set<String> delegatedRoles = delegatedRoles(auth.getName());
            users = users.stream().filter(account -> delegatedUsers.contains(account.getUid())).collect(Collectors.toList());
            organizations = organizations.stream().filter(org -> delegatedOrgs.contains(org.getId())).collect(Collectors.toList());
            roles = roles.stream().filter(role -> delegatedRoles.contains(role.getName())).collect(Collectors.toList());
        }

        users.sort(Comparator.comparing(Account::getUid, Comparator.nullsLast(String::compareToIgnoreCase)));
        organizations.sort(Comparator.comparing(Org::getName, Comparator.nullsLast(String::compareToIgnoreCase)));
        roles.sort(Comparator.comparing(Role::getName, Comparator.nullsLast(String::compareToIgnoreCase)));

        Set<String> expiredUsers = roles.stream()
                .filter(Objects::nonNull)
                .filter(role -> "EXPIRED".equals(role.getName()))
                .flatMap(role -> safeUserList(role).stream())
                .collect(Collectors.toSet());

        List<AdminLogEntry> recentLogs = superuser
                ? logDao.findAll(PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "date"))).getContent()
                : logDao.myFindByTargets(
                        advancedDelegationDao.findUsersUnderDelegation(auth.getName()),
                        PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "date")));

        model.addAttribute("userCount", users.stream().filter(user -> !user.isPending()).count());
        model.addAttribute("pendingUserCount", users.stream().filter(Account::isPending).count());
        model.addAttribute("expiredUserCount", expiredUsers.size());
        model.addAttribute("orgCount", organizations.stream().filter(org -> !org.isPending()).count());
        model.addAttribute("pendingOrgCount", organizations.stream().filter(Org::isPending).count());
        model.addAttribute("roleCount", roles.size());
        model.addAttribute("delegationCount", superuser ? delegationDao.count() : 0L);
        model.addAttribute("recentLogs", recentLogs);
        model.addAttribute("superuser", superuser);
        return "manager/managerHome";
    }

    public void setPublicContextPath(String publicContextPath) {
        this.publicContextPath = publicContextPath;
    }

    private Set<String> delegatedOrgs(String username) {
        DelegationEntry delegationEntry = delegationDao.findFirstByUid(username);
        if (delegationEntry == null || delegationEntry.getOrgs() == null) {
            return Set.of();
        }
        return Arrays.stream(delegationEntry.getOrgs()).collect(Collectors.toSet());
    }

    private Set<String> delegatedRoles(String username) {
        DelegationEntry delegationEntry = delegationDao.findFirstByUid(username);
        if (delegationEntry == null || delegationEntry.getRoles() == null) {
            return Set.of();
        }
        return Arrays.stream(delegationEntry.getRoles()).collect(Collectors.toSet());
    }

    private List<String> safeUserList(Role role) {
        return role.getUserList() == null ? List.of() : role.getUserList();
    }
}
