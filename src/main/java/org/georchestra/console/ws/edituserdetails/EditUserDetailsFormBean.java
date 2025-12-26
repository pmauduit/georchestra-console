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

package org.georchestra.console.ws.edituserdetails;

import lombok.Data;

/**
 * @author Mauricio Pazos
 *
 */
@Data
public class EditUserDetailsFormBean implements java.io.Serializable {

    private String uid;
    private String surname;
    private String firstName;
    private String email;
    private String title;
    private String phone;
    private String facsimile;
    private String org;
    private String description;
    private String postalAddress;
    private boolean isOAuth2;
    private boolean isExternalAuth;

    @Override
    public String toString() {
        return "EditUserDetailsFormBean [uid=" + uid + ", surname=" + surname + ", givenName=" + firstName + ", email="
                + email + ", title=" + title + ", phone=" + phone + ", facsimile=" + facsimile + ", org=" + org
                + ", description=" + description + ", postalAddress=" + postalAddress + "]";
    }
}
