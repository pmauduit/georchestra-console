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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

import jakarta.servlet.http.HttpServletRequest;

import org.georchestra.console.dao.AdminLogDao;
import org.georchestra.console.dao.AdvancedDelegationDao;
import org.georchestra.console.model.AdminLogEntry;
import org.georchestra.console.model.AdminLogType;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.springframework.data.domain.Pageable;
import org.mockito.Mockito;
import org.springframework.data.domain.PageImpl;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.ui.ConcurrentModel;
import org.springframework.ui.Model;

public class ManagerLogsControllerTest {

    private AdminLogDao logDao;
    private AdvancedDelegationDao advancedDelegationDao;
    private ManagerLogsController controller;

    @Before
    public void setUp() {
        logDao = mock(AdminLogDao.class);
        advancedDelegationDao = mock(AdvancedDelegationDao.class);
        controller = new ManagerLogsController(logDao, advancedDelegationDao);

        List<AdminLogEntry> logs = List.of(
                new AdminLogEntry("admin1", "user1", AdminLogType.USER_CREATED, new Date()));
        when(logDao.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(logs));

        Authentication auth = new PreAuthenticatedAuthenticationToken("testadmin", null,
                List.of(new SimpleGrantedAuthority("ROLE_SUPERUSER")));
        SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        Mockito.when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);
    }

    @After
    public void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    public void logsAcceptsAllTypeAndBlankFromDate() {
        Model model = new ConcurrentModel();

        String view = controller.logs(model, mock(HttpServletRequest.class), 500, 0, "all", "all", "all", "",
                "2026-08-12", "date", "desc");

        assertEquals("manager/managerLogs", view);
        assertEquals("all", model.getAttribute("typeFilter"));
        assertEquals(null, model.getAttribute("fromFilter"));
        assertEquals(LocalDate.of(2026, 8, 12), model.getAttribute("toFilter"));
        assertNotNull(model.getAttribute("logs"));
    }

    @Test
    public void logsSortsByAuthorAscending() {
        Model model = new ConcurrentModel();
        List<AdminLogEntry> logs = List.of(
                new AdminLogEntry("zoe", "user2", AdminLogType.USER_CREATED, new Date(2_000L)),
                new AdminLogEntry("alice", "user1", AdminLogType.USER_DELETED, new Date(1_000L)));
        when(logDao.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(logs));

        controller.logs(model, mock(HttpServletRequest.class), 500, 0, "all", "all", "all", "", "", "author",
                "asc");

        @SuppressWarnings("unchecked")
        List<AdminLogEntry> sortedLogs = (List<AdminLogEntry>) model.getAttribute("logs");
        assertNotNull(sortedLogs);
        assertEquals("alice", sortedLogs.get(0).getAdmin());
        assertEquals("zoe", sortedLogs.get(1).getAdmin());
        assertEquals("author", model.getAttribute("sort"));
        assertEquals("asc", model.getAttribute("dir"));
    }
}
