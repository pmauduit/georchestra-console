/*
 * Copyright (C) 2009-2026 by the geOrchestra PSC
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

import java.io.IOException;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.google.common.annotations.VisibleForTesting;
import org.apache.commons.lang3.tuple.Pair;
import org.georchestra.console.dao.AdvancedDelegationDao;
import org.georchestra.console.dao.DelegationDao;
import org.georchestra.console.model.AdminLogType;
import org.georchestra.console.model.DelegationEntry;
import org.georchestra.console.ws.backoffice.utils.RequestUtil;
import org.georchestra.console.ws.backoffice.utils.ResponseUtil;
import org.georchestra.console.ws.utils.LogUtils;
import org.georchestra.ds.DataServiceException;
import org.georchestra.ds.DuplicatedCommonNameException;
import org.georchestra.ds.orgs.Org;
import org.georchestra.ds.orgs.OrgsDao;
import org.georchestra.ds.roles.Role;
import org.georchestra.ds.roles.RoleDao;
import org.georchestra.ds.roles.RoleFactory;
import org.georchestra.ds.roles.RoleSchema;
import org.georchestra.ds.users.Account;
import org.georchestra.ds.users.AccountDao;
import org.georchestra.ds.users.ProtectedUserFilter;
import org.georchestra.ds.users.UserRule;
import org.georchestra.lib.file.FileUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ldap.NameNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PostFilter;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.util.ObjectUtils;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Web Services to maintain the Roles information.
 *
 * @author Mauricio Pazos
 *
 */

@Controller
@Tag(name = "Private API", description = "Private JSON endpoints used by backoffice features or legacy clients.")
public class RolesController {

    private static final Logger LOG = LoggerFactory.getLogger(RolesController.class);

    public static final GrantedAuthority ROLE_SUPERUSER = new SimpleGrantedAuthority("ROLE_SUPERUSER");

    private static final String BASE_MAPPING = "/private";
    private static final String BASE_RESOURCE = "roles";
    private static final String REQUEST_MAPPING = BASE_MAPPING + "/" + BASE_RESOURCE;

    private static final String DUPLICATED_COMMON_NAME = "duplicated_common_name";
    private static final String NOT_FOUND = "not_found";
    private static final String ILLEGAL_CHARACTER = "illegal_character";

    private static final String VIRTUAL_TEMPORARY_ROLE_NAME = "TEMPORARY";
    private static final String VIRTUAL_TEMPORARY_ROLE_DESCRIPTION = "Virtual role that contains all temporary users";

    private static final String VIRTUAL_EXPIRED_ROLE_NAME = "EXPIRED";
    private static final String VIRTUAL_EXPIRED_ROLE_DESCRIPTION = "Virtual role that contains all expired users";

    private AccountDao accountDao;

    private OrgsDao orgDao;

    @Autowired
    protected LogUtils logUtils;

    private AdvancedDelegationDao advancedDelegationDao;

    private DelegationDao delegationDao;

    private RoleDao roleDao;
    private ProtectedUserFilter filter;

    /**
     * Builds a JSON response in case of error.
     *
     * @param mesg a descriptive message of the encountered error.
     * @return a string of the response.
     *
     *         TODO: This code sounds pretty similar to what is done in
     *         ResponseUtil.java:buildResponseMessage() and might deserve a
     *         refactor.
     */

    private String buildErrorResponse(String mesg) {
        HashMap<String, Object> map = new HashMap<String, Object>();
        map.put("success", false);
        map.put("error_message", mesg);
        return new JSONObject(map).toString();
    }

    public RolesController(RoleDao dao, UserRule userRule) {
        this.roleDao = dao;
        this.filter = new ProtectedUserFilter(userRule.getListUidProtected());
    }

    /**
     * Returns all roles. Each roles will contain its list of users.
     *
     * @throws IOException
     */
    @Operation(
            summary = "List roles",
            description = "Returns all roles visible to the caller.\n\n"
                    + "Legacy note: verify external consumers if you plan to change this contract. "
                    + "The current Thymeleaf UI mostly relies on server-rendered pages and a subset of the private role endpoints.",
            responses = @ApiResponse(responseCode = "200", description = "Role list"))
    @GetMapping(value = REQUEST_MAPPING, produces = "application/json; charset=utf-8")
    @PostFilter("hasPermission(filterObject, 'read')")
    @ResponseBody
    public List<Role> findAll() throws DataServiceException {
        List<Role> list = this.roleDao.findAll();
        list.stream().forEach(role -> {
            role.setUserList(filter.filterStringList(role.getUserList()));
        });
        Pair<Role, Role> virtualRoles = this.generateVirtualRoles();
        list.addAll(Arrays.asList(virtualRoles.getLeft(), virtualRoles.getRight()));
        return list;
    }

    /**
     * Returns the detailed information of the role, with its list of users.
     *
     * <p>
     * If the role identifier is not present in the ldap store an
     * {@link IOException} will be throw.
     * </p>
     * <p>
     * URL Format: [BASE_MAPPING]/roles/{cn}
     * </p>
     * <p>
     * Example: [BASE_MAPPING]/roles/role44
     * </p>
     *
     * @param cn Comon name of role
     * @throws IOException
     */
    @Operation(
            summary = "Get role by common name",
            description = "Returns one role by common name.\n\n"
                    + "Legacy note: verify external consumers if you plan to change this contract.",
            responses = @ApiResponse(responseCode = "200", description = "Role details"))
    @GetMapping(value = REQUEST_MAPPING + "/{cn:.+}", produces = "application/json; charset=utf-8")
    @ResponseBody
    public Role findByCN(@PathVariable String cn) throws DataServiceException {
        if (ObjectUtils.isEmpty(cn)) {
            throw new IllegalArgumentException("name is empty");
        }
        Role res;
        if (cn.equals(RolesController.VIRTUAL_TEMPORARY_ROLE_NAME))
            res = this.generateVirtualRoles().getLeft();
        else if (cn.equals(RolesController.VIRTUAL_EXPIRED_ROLE_NAME))
            res = this.generateVirtualRoles().getRight();
        else
            res = this.roleDao.findByCommonName(cn);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (!auth.getAuthorities().contains(ROLE_SUPERUSER)) {
            if (!Arrays.asList(this.delegationDao.findFirstByUid(auth.getName()).getRoles()).contains(cn))
                throw new AccessDeniedException("Role not under delegation");
            res.getUserList().retainAll(this.advancedDelegationDao.findUsersUnderDelegation(auth.getName()));
        }
        return res;
    }

    private Pair<Role, Role> generateVirtualRoles() {

        Role tempRole = RoleFactory.create(RolesController.VIRTUAL_TEMPORARY_ROLE_NAME,
                RolesController.VIRTUAL_TEMPORARY_ROLE_DESCRIPTION, false);
        Role expiredRole = RoleFactory.create(RolesController.VIRTUAL_EXPIRED_ROLE_NAME,
                RolesController.VIRTUAL_EXPIRED_ROLE_DESCRIPTION, false);

        Date today = Calendar.getInstance().getTime();

        this.accountDao.findByShadowExpire().stream().forEach(it -> {
            if (it.getShadowExpire() != null && today.after(it.getShadowExpire())) {
                expiredRole.addUser(it.getUid());
            }
            tempRole.addUser(it.getUid());
        });
        return Pair.of(tempRole, expiredRole);
    }

    /**
     *
     * <p>
     * Creates a new role.
     * </p>
     *
     * <pre>
     * <b>Request</b>
     *
     * role data:
     * {
     *   "cn": "Name of the role"
     *   "description": "Description for the role"
     *   }
     * </pre>
     *
     * <pre>
     * <b>Response</b>
     *
     * <b>- Success case</b>
     *
     * {
     *  "cn": "Name of the role",
     *  "description": "Description for the role"
     * }
     * </pre>
     *
     * @param request
     * @param response
     * @throws IOException
     */
    @Operation(
            summary = "Create role",
            description = "Creates a new role. This endpoint is still used by the current Thymeleaf manager UI.",
            responses = @ApiResponse(responseCode = "200", description = "Role created"))
    @PostMapping(REQUEST_MAPPING)
    @PreAuthorize("hasRole('SUPERUSER')")
    public void create(HttpServletRequest request, HttpServletResponse response) throws IOException {

        try {
            Role role = createRoleFromRequestBody(request.getInputStream());

            this.roleDao.insert(role);
            RoleResponse roleResponse = new RoleResponse(role, this.filter);
            String jsonResponse = roleResponse.asJsonString();
            ResponseUtil.buildResponse(response, jsonResponse, HttpServletResponse.SC_OK);

            // log role creation
            logUtils.createLog(role.getName(), AdminLogType.ROLE_CREATED, null);

        } catch (DuplicatedCommonNameException emailex) {

            String jsonResponse = ResponseUtil.buildResponseMessage(Boolean.FALSE, DUPLICATED_COMMON_NAME);

            ResponseUtil.buildResponse(response, jsonResponse, HttpServletResponse.SC_CONFLICT);

        } catch (DataServiceException dsex) {
            LOG.error("Failed to create role", dsex);
            ResponseUtil.buildResponse(response, buildErrorResponse(dsex.getMessage()),
                    HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            throw new IOException(dsex);
        } catch (IllegalArgumentException ex) {
            String jsonResponse = ResponseUtil.buildResponseMessage(Boolean.FALSE, ILLEGAL_CHARACTER);
            ResponseUtil.buildResponse(response, jsonResponse, HttpServletResponse.SC_CONFLICT);
        }
    }

    /**
     * Deletes the role.
     *
     * The request format is:
     *
     * <pre>
     * [BASE_MAPPING]/roles/{cn}
     *
     * Where <b>cn</b> is the name of role to delete.
     * </pre>
     *
     * @param response
     * @param cn       Common name of role to delete
     * @throws IOException
     */
    @Operation(
            summary = "Delete role",
            description = "Deletes a role. This endpoint is still used by the current Thymeleaf manager UI.",
            responses = @ApiResponse(responseCode = "200", description = "Role deleted"))
    @DeleteMapping(REQUEST_MAPPING + "/{cn:.+}")
    @PreAuthorize("hasRole('SUPERUSER')")
    public void delete(HttpServletResponse response, @PathVariable String cn) throws IOException {
        try {

            // Check if this role is part of a delegation
            for (DelegationEntry delegation : this.advancedDelegationDao.findByRole(cn)) {
                delegation.removeRole(cn);
                this.delegationDao.save(delegation);
            }

            this.roleDao.delete(cn);

            // log role deleted
            logUtils.createLog(cn, AdminLogType.ROLE_DELETED, null);

            ResponseUtil.writeSuccess(response);

        } catch (NameNotFoundException e) {
            LOG.error("Role not found during deletion", e);
            ResponseUtil.buildResponse(response, buildErrorResponse(e.getMessage()), HttpServletResponse.SC_NOT_FOUND);
        } catch (DataServiceException e) {
            LOG.error("Failed to delete role", e);
            ResponseUtil.buildResponse(response, buildErrorResponse(e.getMessage()),
                    HttpServletResponse.SC_BAD_REQUEST);
        } catch (Exception e) {
            LOG.error("Unexpected error while deleting role", e);
            ResponseUtil.buildResponse(response, buildErrorResponse(e.getMessage()),
                    HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            throw new IOException(e);
        }
    }

    /**
     * Modifies the role using the fields provided in the request body.
     * <p>
     * The fields that are not present in the parameters will remain untouched in
     * the LDAP store.
     * </p>
     *
     * <pre>
     * The request format is:
     * [BASE_MAPPING]/roles/{cn}
     *
     * Where <b>cn</b> is the name of role to update.
     * </pre>
     * <p>
     * The request body should contains a the fields to modify using the JSON
     * syntax.
     * </p>
     * <p>
     * Example:
     * </p>
     *
     * <pre>
     * <b>Request</b>
     * [BASE_MAPPING]/roles/users
     *
     * <b>Body request: </b>
     * role data:
     * {
     *   "cn": "newName"
     *   "description": "new Description"
     *   }
     *
     * </pre>
     *
     * @param request  [BASE_MAPPING]/roles/{cn} body request {"cn": value1,
     *                 "description": value2 }
     * @param response
     *
     * @throws IOException if the uid does not exist or fails to access to the LDAP
     *                     store.
     */
    @Operation(
            summary = "Update role",
            description = "Updates a role. This endpoint is still used by the current Thymeleaf manager UI.",
            responses = @ApiResponse(responseCode = "200", description = "Role updated"))
    @PutMapping(REQUEST_MAPPING + "/{cn:.+}")
    @PreAuthorize("hasRole('SUPERUSER')")
    public void update(HttpServletRequest request, HttpServletResponse response, @PathVariable String cn)
            throws IOException {

        // searches the role
        Role role;
        try {
            role = this.roleDao.findByCommonName(cn);
        } catch (NameNotFoundException e) {
            ResponseUtil.writeError(response, NOT_FOUND);
            return;
        } catch (DataServiceException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            throw new IOException(e);
        }

        // modifies the role data
        try {
            final Role modified = modifyRole(role, request.getInputStream());

            this.roleDao.update(cn, modified);

            RoleResponse roleResponse = new RoleResponse(role, this.filter);

            String jsonResponse = roleResponse.asJsonString();

            ResponseUtil.buildResponse(response, jsonResponse, HttpServletResponse.SC_OK);

            ResponseUtil.writeSuccess(response);

        } catch (NameNotFoundException e) {

            ResponseUtil.buildResponse(response, ResponseUtil.buildResponseMessage(Boolean.FALSE, NOT_FOUND),
                    HttpServletResponse.SC_NOT_FOUND);

            return;

        } catch (DuplicatedCommonNameException e) {

            String jsonResponse = ResponseUtil.buildResponseMessage(Boolean.FALSE, DUPLICATED_COMMON_NAME);

            ResponseUtil.buildResponse(response, jsonResponse, HttpServletResponse.SC_CONFLICT);

            return;

        } catch (DataServiceException e) {
            LOG.error("Failed to update role", e);
            ResponseUtil.buildResponse(response, buildErrorResponse(e.getMessage()),
                    HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            throw new IOException(e);
        }
    }

    /**
     * Updates the users of role. This method will add or delete the role of users
     * from the list of roles.
     *
     * @param request  request [BASE_MAPPING]/roles_users body request {"users":
     *                 [u1,u2,u3], "PUT": [g1,g2], "DELETE":[g3,g4] }
     * @param response
     * @throws IOException
     */
    @Operation(
            summary = "Update user-role assignments",
            description = "Adds or removes roles for the given users. This endpoint is still used by the current Thymeleaf manager UI.",
            responses = @ApiResponse(responseCode = "200", description = "Assignments updated"))
    @PostMapping(BASE_MAPPING + "/roles_users")
    public void updateUsers(HttpServletRequest request, HttpServletResponse response)
            throws AccessDeniedException, IOException, JSONException, DataServiceException {

        JSONObject json = new JSONObject(FileUtils.asString(request.getInputStream()));

        List<String> users = createUserOrOrgList(json, "users");
        List<String> putRole = createUserOrOrgList(json, "PUT");
        List<String> deleteRole = createUserOrOrgList(json, "DELETE");

        List<Account> accounts = users.stream().map(userUuid -> {
            try {
                return accountDao.findByUID(userUuid);
            } catch (DataServiceException e) {
                LOG.debug("Failed to load account {}", userUuid, e);
                return null;
            }
        }).filter(account -> null != account).collect(Collectors.toList());

        // Don't allow modification of ORGADMIN role
        if (putRole.contains("ORGADMIN") || deleteRole.contains("ORGADMIN")) {
            throw new IllegalArgumentException("ORGADMIN role cannot be add or delete");
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (!auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_SUPERUSER"))) {
            this.checkAuthorization(auth.getName(), users, putRole, deleteRole);
        }

        this.roleDao.addUsersInRoles(putRole, accounts);
        this.roleDao.deleteUsersInRoles(deleteRole, accounts);

        // create log
        logUtils.logRolesUsersAction(putRole, deleteRole, accounts);

        ResponseUtil.writeSuccess(response);
    }

    @Operation(
            summary = "Update organization-role assignments",
            description = "Adds or removes roles for the users of the given organizations.\n\n"
                    + "Legacy note: this endpoint does not appear to be used by the current Thymeleaf UI. "
                    + "Verify external consumers before changing or removing it.",
            responses = @ApiResponse(responseCode = "200", description = "Assignments updated"))
    @PostMapping(BASE_MAPPING + "/roles_orgs")
    public void updateOrgs(HttpServletRequest request, HttpServletResponse response)
            throws AccessDeniedException, IOException, JSONException, DataServiceException {
        JSONObject json = new JSONObject(FileUtils.asString(request.getInputStream()));

        List<String> orgsCN = createUserOrOrgList(json, "orgs");
        List<String> putRole = createUserOrOrgList(json, "PUT");
        List<String> deleteRole = createUserOrOrgList(json, "DELETE");

        List<Org> orgs = orgsCN.stream() //
                .map(orgDao::findByCommonName) //
                .filter(Objects::nonNull).collect(Collectors.toList());

        List<Account> accounts = orgs.stream() //
                .map(Org::getMembers) //
                .map(List::stream) //
                .flatMap(s -> s.map(this::findAccount).filter(Objects::nonNull)) //
                .collect(Collectors.toList());

        this.roleDao.addUsersInRoles(putRole, accounts);
        this.roleDao.deleteUsersInRoles(deleteRole, accounts);
        this.roleDao.addOrgsInRoles(putRole, orgs);
        this.roleDao.deleteOrgsInRoles(deleteRole, orgs);

        ResponseUtil.writeSuccess(response);
    }

    private Account findAccount(String uuid) {
        try {
            return accountDao.findByUID(uuid);
        } catch (DataServiceException e) {
            return null;
        }
    }

    public void checkAuthorization(String delegatedAdmin, List<String> users, List<String> putRole,
            List<String> deleteRole) throws AccessDeniedException {
        // Verify authorization
        Set<String> usersUnderDelegation = this.advancedDelegationDao.findUsersUnderDelegation(delegatedAdmin);
        if (!usersUnderDelegation.containsAll(users))
            throw new AccessDeniedException("Some users are not under delegation");
        DelegationEntry delegation = this.delegationDao.findFirstByUid(delegatedAdmin);
        if (!Arrays.asList(delegation.getRoles()).containsAll(putRole))
            throw new AccessDeniedException("Some roles are not under delegation (put)");
        if (!Arrays.asList(delegation.getRoles()).containsAll(deleteRole))
            throw new AccessDeniedException("Some roles are not under delegation (delete)");

    }

    private List<String> createUserOrOrgList(JSONObject json, String arrayKey) throws IOException {
        try {
            JSONArray jsonArray = json.getJSONArray(arrayKey);
            return IntStream.range(0, jsonArray.length()) //
                    .mapToObj(jsonArray::getString) //
                    .collect(Collectors.toList());
        } catch (Exception e) {
            LOG.error("Failed to parse JSON array '{}'", arrayKey, e);
            throw new IOException(e);
        }
    }

    /**
     * Modifies the original field using the values in the inputStream.
     *
     * @param role        role to modify
     * @param inputStream contains the new values
     *
     * @return the {@link Role} modified
     */
    private Role modifyRole(Role role, ServletInputStream inputStream) throws IOException {

        String strRole = FileUtils.asString(inputStream);
        JSONObject json;
        try {
            json = new JSONObject(strRole);
        } catch (JSONException e) {
            LOG.error("Failed to parse role JSON payload", e);
            throw new IOException(e);
        }

        String cn = RequestUtil.getFieldValue(json, RoleSchema.COMMON_NAME_KEY);
        if (cn != null) {
            role.setName(cn);
        }

        String description = RequestUtil.getFieldValue(json, RoleSchema.DESCRIPTION_KEY);
        if (description != null) {
            role.setDescription(description);
        }

        Boolean isFavorite = RequestUtil.getBooleanFieldValue(json, RoleSchema.FAVORITE_JSON_KEY);
        if (isFavorite != null)
            role.setFavorite(isFavorite);

        return role;
    }

    private Role createRoleFromRequestBody(ServletInputStream is) throws IOException, IllegalArgumentException {
        try {
            String strRole = FileUtils.asString(is);
            JSONObject json = new JSONObject(strRole);

            String commonName = RequestUtil.getFieldValue(json, RoleSchema.COMMON_NAME_KEY);
            if (commonName == null) {
                throw new IllegalArgumentException(RoleSchema.COMMON_NAME_KEY + " is required");
            }

            // Capitalize role name and check format
            commonName = commonName.toUpperCase();
            Pattern p = Pattern.compile("[A-Z0-9_-]+");
            if (!p.matcher(commonName).matches())
                throw new IllegalArgumentException(RoleSchema.COMMON_NAME_KEY
                        + " should only contain uppercased letters, digits, dashes and underscores");

            String description = RequestUtil.getFieldValue(json, RoleSchema.DESCRIPTION_KEY);
            Boolean isFavorite = RequestUtil.getBooleanFieldValue(json, RoleSchema.FAVORITE_JSON_KEY);

            Role role = RoleFactory.create(commonName, description, isFavorite);

            return role;

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            LOG.error("Failed to create role from request body", e);
            throw new IOException(e);
        }
    }

    @Autowired
    public void setAccountDao(AccountDao ad) {
        this.accountDao = ad;
    }

    @Autowired
    public void setOrgDao(OrgsDao orgDao) {
        this.orgDao = orgDao;
    }

    public AdvancedDelegationDao getAdvancedDelegationDao() {
        return advancedDelegationDao;
    }

    @Autowired
    public void setAdvancedDelegationDao(AdvancedDelegationDao advancedDelegationDao) {
        this.advancedDelegationDao = advancedDelegationDao;
    }

    public DelegationDao getDelegationDao() {
        return delegationDao;
    }

    @Autowired
    public void setDelegationDao(DelegationDao delegationDao) {
        this.delegationDao = delegationDao;
    }
}
