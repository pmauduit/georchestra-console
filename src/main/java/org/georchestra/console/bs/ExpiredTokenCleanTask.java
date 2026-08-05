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

package org.georchestra.console.bs;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.georchestra.console.ds.UserTokenDao;
import org.georchestra.ds.DataServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This task searches and removes the expired tokens generated when for the
 * "lost password" use case.
 *
 * @author Mauricio Pazos
 *
 */
public class ExpiredTokenCleanTask implements Runnable {

    private static final Logger LOG = LoggerFactory.getLogger(ExpiredTokenCleanTask.class);

    private UserTokenDao userTokenDao;

    private long delayInMilliseconds;

    public ExpiredTokenCleanTask(UserTokenDao userTokenDao) {

        this.userTokenDao = userTokenDao;
    }

    public void setDelayInMilliseconds(long delayInMiliseconds) {

        this.delayInMilliseconds = delayInMiliseconds;
    }

    /**
     * Removes the expired tokens
     *
     * This task is scheduled taking into account the delay period.
     */
    @Override
    public void run() {

        Calendar calendar = Calendar.getInstance();

        long now = calendar.getTimeInMillis();
        Date expired = new Date(now - this.delayInMilliseconds);

        try {
            List<Map<String, Object>> userTokenToDelete = userTokenDao.findBeforeDate(expired);
            for (Map<String, Object> userToken : userTokenToDelete) {
                try {
                    userTokenDao.delete((String) userToken.get("uid"));
                } catch (Exception e) {
                    LOG.error("Failed to delete expired token for uid {}", userToken.get("uid"), e);
                }
            }
        } catch (DataServiceException e1) {
            LOG.error("Failed to remove expired tokens", e1);
        }
    }
}
