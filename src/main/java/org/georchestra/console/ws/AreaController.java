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

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import jakarta.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.core.io.ClassPathResource;

/**
 * A simple controller to serve an area.json file from your datadir.
 */
@Controller
public class AreaController {

    @Value("${AreasUrl:area.geojson}")
    private String areasUrl;

    @Value("${georchestra.datadir:/etc/georchestra}")
    private String datadir;

    /**
     * serve a json file put in the datadir or redirect to a url if AreaUrl in the
     * config is set to a url.
     *
     * @return json or rediurect to the resource if area is an URL
     * @throws IOException
     */
    @GetMapping(value = "/public/area.geojson", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String serveArea(HttpServletResponse response) throws IOException {
        // if arealUrl in config is an http endpoint, then send it directly.
        if (StringUtils.hasText(areasUrl) && isURL(areasUrl)) {
            response.sendRedirect(areasUrl);
            return "";
        }
        try (InputStream stream = openAreaStream()) {
            String jsonString = StreamUtils.copyToString(stream, StandardCharsets.UTF_8);
            return new JSONObject(jsonString).toString();
        } catch (IOException ioe) {
            // in case there are any errors with the area file, pretend it didn't exist.
            response.setStatus(404);
            return "{\"error\": \"area.geojson not found\"}";
        } catch (JSONException ex) {
            response.setStatus(500);
            return "{\"error\": \"specifed file (area.geojson) could not be parsed server side\"}";
        }
    }

    /**
     * try to be a bit permissive in what path we accept for area.json file, could
     * be just `area.json` could be /the/whole/path/to/datadir/
     */
    private InputStream openAreaStream() throws IOException {
        for (String resourceLocation : getCandidateLocations()) {
            if (resourceLocation.startsWith("classpath:")) {
                String classpathLocation = resourceLocation.substring("classpath:".length());
                ClassPathResource resource = new ClassPathResource(classpathLocation);
                if (resource.exists()) {
                    return resource.getInputStream();
                }
                continue;
            }

            File candidate = new File(resourceLocation);
            if (candidate.exists()) {
                return new FileInputStream(candidate);
            }
        }
        throw new IOException("No area definition file found");
    }

    private List<String> getCandidateLocations() {
        List<String> candidates = new ArrayList<>();
        candidates.add(areasUrl);
        candidates.add(Paths.get(datadir, areasUrl).toString());
        candidates.add(Paths.get(datadir, "console", areasUrl).toString());
        candidates.add("classpath:" + areasUrl);
        return candidates;
    }

    /**
     * Check if the path given in AreaUrl is an actual URL or a file
     */
    private boolean isURL(String possibleUrl) {
        return possibleUrl.startsWith("http");
    }
}
