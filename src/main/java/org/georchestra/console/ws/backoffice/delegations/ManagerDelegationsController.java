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
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.georchestra.console.dao.DelegationDao;
import org.georchestra.console.model.DelegationEntry;
import org.georchestra.ds.orgs.Org;
import org.georchestra.ds.orgs.OrgsDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/manager")
public class ManagerDelegationsController {

    private static final int PAGE_SIZE = 15;

    private final DelegationDao delegationDao;
    private final OrgsDao orgDao;

    @Autowired
    public ManagerDelegationsController(DelegationDao delegationDao, OrgsDao orgDao) {
        this.delegationDao = delegationDao;
        this.orgDao = orgDao;
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
}
