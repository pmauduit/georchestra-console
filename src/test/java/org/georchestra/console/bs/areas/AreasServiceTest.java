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

package org.georchestra.console.bs.areas;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.same;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.io.InputStream;
import java.io.IOException;
import java.lang.reflect.Field;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.georchestra.commons.configuration.GeorchestraConfiguration;
import org.georchestra.ds.orgs.Org;
import org.georchestra.ds.orgs.OrgsDao;
import org.georchestra.ds.users.Account;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.LinearRing;
import org.locationtech.jts.geom.Polygon;

import lombok.NonNull;

public class AreasServiceTest {

    private AreasService service;
    private @NonNull GeorchestraConfiguration georConfig;

    private Account accountMock;
    private OrgsDao orgsDaoMock;
    private Org orgMock;

    private static Map<String, Geometry> geomsByInseeComId = new HashMap<>();
    private static final GeometryFactory GEOMETRY_FACTORY = new GeometryFactory();

    public static @BeforeAll void loadTestData() throws IOException {
        try (InputStream input = AreasServiceTest.class.getResourceAsStream("/org/georchestra/console/bs/areas/cities.geojson")) {
            String json = new String(input.readAllBytes(), StandardCharsets.UTF_8);
            JSONObject featureCollection = new JSONObject(json);
            JSONArray features = featureCollection.getJSONArray("features");
            geomsByInseeComId = new HashMap<>();
            for (int i = 0; i < features.length(); i++) {
                JSONObject feature = features.getJSONObject(i);
                geomsByInseeComId.put(feature.getJSONObject("properties").getString("INSEE_COM"),
                        parseGeometry(feature.getJSONObject("geometry")));
            }
        }
        assertEquals(3, geomsByInseeComId.size());
        assertEquals(Set.of("2B298", "2A322", "2B277"), geomsByInseeComId.keySet());
    }

    public @BeforeEach void beforeEach() {
        georConfig = new GeorchestraConfiguration("console");
        accountMock = mock(Account.class);
        orgMock = mock(Org.class);
        orgsDaoMock = mock(OrgsDao.class);
        when(orgsDaoMock.findByUser(same(accountMock))).thenReturn(orgMock);
        service = new AreasService(orgsDaoMock, georConfig, "cities.geojson");
    }

    @Test
    public void getAreaOfCompetence_Org_cities_null() throws IOException {
        when(orgMock.getCities()).thenReturn(null);
        assertNull(service.getAreaOfCompetence(accountMock));
    }

    @Test
    public void getAreaOfCompetence_Org_cities_empty_returns_null() throws IOException {
        when(orgMock.getCities()).thenReturn(Collections.emptyList());
        assertNull(service.getAreaOfCompetence(accountMock));
    }

    @Test
    public void getAreaOfCompetence_absolute_url() throws IOException {
        List<String> INSEE_COM_ids = List.of("2B298", "2B277");
        Geometry expected = geomsByInseeComId.get("2B298").buffer(0d).union(geomsByInseeComId.get("2B277").buffer(0d));
        testGetAreaOfCompetence(INSEE_COM_ids, expected);
    }

    @Test
    public void getAreaOfCompetence_absolute_no_ids_match() throws IOException {
        List<String> INSEE_COM_ids = List.of("123", "456");// no ids match
        Geometry expectedEmptyPolygon = new GeometryFactory().createEmpty(2);
        testGetAreaOfCompetence(INSEE_COM_ids, expectedEmptyPolygon);
    }

    @Test
    public void getAreaOfCompetence_some_ids_match() throws IOException {
        List<String> INSEE_COM_ids = List.of("123_no_match", "2B298", "2A322", "2B277", "456_no_match");
        Geometry expected = geomsByInseeComId.get("2B298").buffer(0d).union(geomsByInseeComId.get("2A322").buffer(0d))
                .union(geomsByInseeComId.get("2B277").buffer(0d));
        testGetAreaOfCompetence(INSEE_COM_ids, expected);
    }

    private void testGetAreaOfCompetence(List<String> inseeComIds, Geometry expected) throws IOException {
        when(orgMock.getCities()).thenReturn(inseeComIds);
        setDataStore(fakeDataStore());
        Geometry areaOfCompetence = service.getAreaOfCompetence(accountMock);
        assertNotNull(areaOfCompetence);

        assertEquals(expected, areaOfCompetence);
    }

    private AreasDataStore fakeDataStore() throws IOException {
        AreasDataStore dataStore = mock(AreasDataStore.class);
        Map<String, Geometry> orderedGeometries = new LinkedHashMap<>(geomsByInseeComId);
        when(dataStore.findAreasById(org.mockito.ArgumentMatchers.anyList())).thenAnswer(invocation -> invocation
                .<List<String>>getArgument(0).stream().map(orderedGeometries::get).filter(java.util.Objects::nonNull).toList());
        return dataStore;
    }

    private void setDataStore(AreasDataStore dataStore) {
        try {
            Field field = AreasService.class.getDeclaredField("dataStore");
            field.setAccessible(true);
            field.set(service, dataStore);
        } catch (ReflectiveOperationException e) {
            throw new RuntimeException(e);
        }
    }

    private static Geometry parseGeometry(JSONObject geometry) {
        String type = geometry.getString("type");
        if (!"Polygon".equals(type)) {
            throw new IllegalArgumentException("Unsupported GeoJSON geometry type in test fixture: " + type);
        }
        JSONArray rings = geometry.getJSONArray("coordinates");
        LinearRing shell = GEOMETRY_FACTORY.createLinearRing(toCoordinates(rings.getJSONArray(0)));
        LinearRing[] holes = new LinearRing[Math.max(0, rings.length() - 1)];
        for (int i = 1; i < rings.length(); i++) {
            holes[i - 1] = GEOMETRY_FACTORY.createLinearRing(toCoordinates(rings.getJSONArray(i)));
        }
        Polygon polygon = GEOMETRY_FACTORY.createPolygon(shell, holes);
        return polygon;
    }

    private static Coordinate[] toCoordinates(JSONArray points) {
        Coordinate[] coordinates = new Coordinate[points.length()];
        for (int i = 0; i < points.length(); i++) {
            JSONArray point = points.getJSONArray(i);
            coordinates[i] = new Coordinate(point.getDouble(0), point.getDouble(1));
        }
        return coordinates;
    }
}
