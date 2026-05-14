/*
 * Copyright (C) 2009-2025 by the geOrchestra PSC
 *
 * This file is part of geOrchestra.
 *
 * geOrchestra is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option)
 * any later version.
 *
 * geOrchestra is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * geOrchestra.  If not, see <http://www.gnu.org/licenses/>.
 */

package org.georchestra.console.ws;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@ControllerAdvice
public class GlobalViewAttributes {

    @Value("${useLegacyHeader:false}")
    private boolean useLegacyHeader;

    @Value("${headerUrl:/header/}")
    private String headerUrl;

    @Value("${headerHeight:80}")
    private String headerHeight;

    @Value("${headerScript:https://cdn.jsdelivr.net/gh/georchestra/header@dist/header.js}")
    private String headerScript;

    @Value("${logoUrl:https://www.georchestra.org/public/georchestra-logo.svg}")
    private String logoUrl;

    @Value("${georchestraStylesheet:}")
    private String georchestraStylesheet;

    @Value("${headerConfigFile:}")
    private String headerConfigFile;

    @Value("${publicContextPath:/console}")
    private String publicContextPath;

    @ModelAttribute("header")
    public HeaderAttributes headerAttributes() {
        return new HeaderAttributes(useLegacyHeader, headerUrl, headerHeight, headerScript, logoUrl,
                georchestraStylesheet, headerConfigFile);
    }

    @ModelAttribute("publicContextPath")
    public String publicContextPath() {
        return publicContextPath;
    }

    @ModelAttribute("isSuperuserView")
    public boolean isSuperuserView() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_SUPERUSER".equals(authority.getAuthority()));
    }

    public record HeaderAttributes(boolean useLegacyHeader, String headerUrl, String headerHeight,
            String headerScript, String logoUrl, String georchestraStylesheet, String headerConfigFile) {
    }
}
