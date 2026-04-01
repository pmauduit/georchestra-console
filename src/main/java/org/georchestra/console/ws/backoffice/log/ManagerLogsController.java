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
package org.georchestra.console.ws.backoffice.log;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.servlet.http.HttpServletRequest;

import org.georchestra.console.dao.AdminLogDao;
import org.georchestra.console.dao.AdvancedDelegationDao;
import org.georchestra.console.model.AdminLogEntry;
import org.georchestra.console.model.AdminLogType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/manager")
public class ManagerLogsController {

    private static final GrantedAuthority ROLE_SUPERUSER = new SimpleGrantedAuthority("ROLE_SUPERUSER");

    private final AdminLogDao logDao;
    private final AdvancedDelegationDao advancedDelegationDao;

    @Autowired
    public ManagerLogsController(AdminLogDao logDao, AdvancedDelegationDao advancedDelegationDao) {
        this.logDao = logDao;
        this.advancedDelegationDao = advancedDelegationDao;
    }

    @GetMapping("/logs")
    @PreAuthorize("hasAnyRole('SUPERUSER','ORGADMIN')")
    public String logs(Model model,
                       HttpServletRequest request,
                       @RequestParam(defaultValue = "500") int limit,
                       @RequestParam(defaultValue = "0") int page,
                       @RequestParam(required = false) String admin,
                       @RequestParam(required = false) String target,
                       @RequestParam(required = false) AdminLogType type,
                       @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                       @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        List<AdminLogEntry> logs = fetchLogsForUser(auth, limit, page);

        logs = applyFilters(logs, admin, target, type, from, to);

        model.addAttribute("logs", logs);
        model.addAttribute("adminFilter", admin == null ? "all" : admin);
        model.addAttribute("targetFilter", target == null ? "all" : target);
        model.addAttribute("typeFilter", type == null ? "all" : type.name());
        model.addAttribute("fromFilter", from);
        model.addAttribute("toFilter", to);

        model.addAttribute("admins", extractDistinct(logs, AdminLogEntry::getAdmin));
        model.addAttribute("targets", extractDistinct(logs, AdminLogEntry::getTarget));
        model.addAttribute("types", extractDistinct(logs, l -> l.getType() == null ? "" : l.getType().name()));
        model.addAttribute("allTypes", AdminLogType.values());

        return "managerLogs";
    }

    private List<AdminLogEntry> fetchLogsForUser(Authentication auth, int limit, int page) {
        if (auth == null) {
            throw new AccessDeniedException("No authentication");
        }
        if (auth.getAuthorities().contains(ROLE_SUPERUSER)) {
            return logDao.findAll(PageRequest.of(page, limit, Sort.by(Sort.Direction.DESC, "date"))).getContent();
        }
        Set<String> users = advancedDelegationDao.findUsersUnderDelegation(auth.getName());
        return logDao.myFindByTargets(users, PageRequest.of(page, limit, Sort.by(Sort.Direction.DESC, "date")));
    }

    private List<AdminLogEntry> applyFilters(List<AdminLogEntry> logs, String admin, String target,
                                             AdminLogType type, LocalDate from, LocalDate to) {
        Instant fromInstant = from == null ? null : from.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant toInstant = to == null ? null : to.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        return logs.stream()
                .filter(log -> admin == null || admin.isBlank() || "all".equals(admin) || admin.equals(log.getAdmin()))
                .filter(log -> target == null || target.isBlank() || "all".equals(target) || target.equals(log.getTarget()))
                .filter(log -> type == null || log.getType() == type)
                .filter(log -> fromInstant == null || (log.getDate() != null && !log.getDate().toInstant().isBefore(fromInstant)))
                .filter(log -> toInstant == null || (log.getDate() != null && log.getDate().toInstant().isBefore(toInstant)))
                .sorted(Comparator.comparing(AdminLogEntry::getDate, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .collect(Collectors.toList());
    }

    private List<String> extractDistinct(List<AdminLogEntry> logs, java.util.function.Function<AdminLogEntry, String> extractor) {
        LinkedHashSet<String> values = new LinkedHashSet<>();
        for (AdminLogEntry log : logs) {
            String value = extractor.apply(log);
            if (value != null && !value.isBlank()) {
                values.add(value);
            }
        }
        return new ArrayList<>(values);
    }
}
