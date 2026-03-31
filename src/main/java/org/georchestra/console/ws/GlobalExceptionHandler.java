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

import jakarta.servlet.http.HttpServletRequest;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.georchestra.console.ws.backoffice.utils.Response;
import org.georchestra.console.ws.backoffice.utils.ResponseUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.ldap.NameNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.ModelAndView;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Log LOG = LogFactory.getLog(GlobalExceptionHandler.class.getName());

    @ExceptionHandler(NameNotFoundException.class)
    public Object handleNameNotFoundException(NameNotFoundException e, HttpServletRequest request) {
        LOG.info(e.getMessage());
        return respond(request, HttpStatus.NOT_FOUND, "Resource not found", e.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public Object handleAccessDeniedException(AccessDeniedException e, HttpServletRequest request) {
        LOG.debug(e.getMessage());
        return respond(request, HttpStatus.FORBIDDEN, "Forbidden", e.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public Object handleException(Exception e, HttpServletRequest request) {
        LOG.error(e.getMessage(), e);
        return respond(request, HttpStatus.INTERNAL_SERVER_ERROR, "Internal error", e.getMessage());
    }

    private Object respond(HttpServletRequest request, HttpStatus status, String title, String message) {
        if (wantsJson(request)) {
            Response body = ResponseUtil.failure(message);
            return ResponseEntity.status(status).body(body);
        }
        ModelAndView modelAndView = new ModelAndView("error");
        modelAndView.setStatus(status);
        modelAndView.addObject("status", status.value());
        modelAndView.addObject("title", title);
        modelAndView.addObject("message", message == null || message.isBlank() ? title : message);
        return modelAndView;
    }

    private boolean wantsJson(HttpServletRequest request) {
        String requestedWith = request.getHeader("X-Requested-With");
        if ("XMLHttpRequest".equalsIgnoreCase(requestedWith)) {
            return true;
        }

        String accept = request.getHeader("Accept");
        if (accept != null && accept.contains("application/json")) {
            return true;
        }

        String uri = request.getRequestURI();
        return uri.contains("/private/") || uri.contains("/manager/") || uri.contains("/internal/");
    }
}
