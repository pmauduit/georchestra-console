/*
 * Copyright (C) 2026 by the geOrchestra PSC
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
package org.georchestra.console.autoconfiguration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.boot.info.BuildProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfiguration {

    private final BuildProperties buildProperties;

    public OpenApiConfiguration(BuildProperties buildProperties) {
        this.buildProperties = buildProperties;
    }

    @Bean
    GroupedOpenApi internalApi() {
        return GroupedOpenApi.builder()
                .group("internal")
                .pathsToMatch("/internal/**")
                .build();
    }

    @Bean
    OpenAPI consoleOpenApi() {
        return new OpenAPI().info(new Info()
                .title("geOrchestra Console API")
                .description("OpenAPI documentation for the geOrchestra Console internal endpoints.")
                .version(buildProperties.getVersion())
                .contact(new Contact()
                        .name("geOrchestra PSC")
                        .url("https://www.georchestra.org")));
    }
}
