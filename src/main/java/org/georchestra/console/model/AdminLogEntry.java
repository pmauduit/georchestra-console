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

package org.georchestra.console.model;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;

import org.hibernate.annotations.JdbcTypeCode;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.type.SqlTypes;

@Entity
@Table(schema = "console", name = "admin_log")
@NamedQueries({
        @NamedQuery(name = "AdminLogEntry.findByTargetPageable", query = "SELECT l FROM AdminLogEntry l WHERE l.target = :target ORDER BY l.date DESC"),
        @NamedQuery(name = "AdminLogEntry.myFindByTargets", query = "SELECT l FROM AdminLogEntry l WHERE l.target IN :targets ORDER BY l.date DESC") })
public class AdminLogEntry {

    @Id
    @SequenceGenerator(name = "admin_log_seq", schema = "console", sequenceName = "admin_log_seq", initialValue = 1, allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "admin_log_seq")
    @JsonIgnore
    private long id;
    private String admin;
    private String target;
    private AdminLogType type;
    private static final DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ");

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String changed;

    @Column(updatable = false, nullable = false)
    @JsonIgnore
    private Date date;

    public AdminLogEntry() {
    }

    public AdminLogEntry(String admin, String target, AdminLogType type, Date date) {
        this.admin = admin;
        this.target = target;
        this.type = type;
        this.date = date;
    }

    /**
     * Constructor
     *
     * @param admin   String that realized action
     * @param target  String user concerned by this action
     * @param type    AdminLogType to identify action
     * @param date    Date of log
     * @param changed String to save changed as JSON
     */
    public AdminLogEntry(String admin, String target, AdminLogType type, Date date, String changed) {
        this.admin = admin;
        this.target = target;
        this.type = type;
        this.date = date;
        this.changed = changed;
    }

    public String getChanged() {
        return changed;
    }

    public void setChanged(String changed) {
        this.changed = changed;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getAdmin() {
        return admin;
    }

    public void setAdmin(String admin) {
        this.admin = admin;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }

    public AdminLogType getType() {
        return type;
    }

    public void setType(AdminLogType type) {
        this.type = type;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    @JsonGetter("date")
    public String getFormattedDate() {
        return AdminLogEntry.dateFormat.format(this.date);
    }

}
