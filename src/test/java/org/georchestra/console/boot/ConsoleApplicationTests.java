package org.georchestra.console.boot;

import org.geonetwork.testcontainers.postgres.GeorchestraDatabaseContainer;
import org.georchestra.testcontainers.ldap.GeorchestraLdapContainer;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.text.MessageFormat;

@SpringBootTest
@Testcontainers
class ConsoleApplicationTests {

	@Test
	void contextLoads() {
	}

	static GeorchestraDatabaseContainer databaseContainer = new GeorchestraDatabaseContainer();
	static GeorchestraLdapContainer ldapContainer = new GeorchestraLdapContainer();

	@DynamicPropertySource
	static void georchestraProperties(DynamicPropertyRegistry registry) {
		databaseContainer.start();
		ldapContainer.start();
		registry.add("spring.datasource.url", () -> {
			String jdbcUrl = new MessageFormat("jdbc:postgresql://{0}:{1}/georchestra").format(
					new String[] {
							databaseContainer.getHost(),
							Integer.toString(databaseContainer.getMappedDatabasePort())
					}
			);
			return jdbcUrl;
		});
		registry.add("spring.datasource.username", () -> "georchestra");
		registry.add("spring.datasource.password", () -> "georchestra");
		registry.add("spring.jpa.properties.hibernate.dialect", () -> "org.hibernate.dialect.PostgreSQLDialect");
	}

}
