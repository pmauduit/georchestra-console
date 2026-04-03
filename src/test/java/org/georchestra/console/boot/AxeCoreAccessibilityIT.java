package org.georchestra.console.boot;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.text.MessageFormat;
import java.util.Locale;

import org.geonetwork.testcontainers.postgres.GeorchestraDatabaseContainer;
import org.georchestra.testcontainers.ldap.GeorchestraLdapContainer;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@Testcontainers
class AxeCoreAccessibilityIT {

    private static final GeorchestraDatabaseContainer databaseContainer = new GeorchestraDatabaseContainer();
    private static final GeorchestraLdapContainer ldapContainer = new GeorchestraLdapContainer();

    @Autowired
    private WebApplicationContext wac;

    private MockMvc mockMvc;

    @DynamicPropertySource
    static void georchestraProperties(DynamicPropertyRegistry registry) {
        databaseContainer.start();
        ldapContainer.start();
        registry.add("spring.datasource.url", () -> new MessageFormat("jdbc:postgresql://{0}:{1}/georchestra")
                .format(new String[] { databaseContainer.getHost(), Integer.toString(databaseContainer.getMappedDatabasePort()) }));
        registry.add("spring.datasource.username", () -> "georchestra");
        registry.add("spring.datasource.password", () -> "georchestra");
        registry.add("spring.jpa.properties.hibernate.dialect", () -> "org.hibernate.dialect.PostgreSQLDialect");
        registry.add("ldapPort", () -> ldapContainer.getMappedLdapPort());
        registry.add("pgsqlHost", () -> databaseContainer.getHost());
        registry.add("pgsqlPort", () -> databaseContainer.getMappedDatabasePort());
        registry.add("pgsqlDatabase", () -> "georchestra");
        registry.add("pgsqlUser", () -> "georchestra");
        registry.add("pgsqlPassword", () -> "georchestra");
    }

    @BeforeEach
    void setUpMockMvc() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(this.wac)
                .apply(springSecurity())
                .build();
    }

    @Test
    void passwordRecoveryPageExposesLanguageSkipLinkAndFormLabels() throws Exception {
        Document document = getDocument("/account/passwordRecovery");

        assertCommonMarkers(document);
        assertThat(document.select("label[for=email]")).hasSize(1);
        assertThat(document.select("input#email")).hasSize(1);
        assertThat(document.select("fieldset legend")).isNotEmpty();
    }

    @Test
    void createAccountPageExposesLanguageSkipLinkAndMainLandmark() throws Exception {
        Document document = getDocument("/account/new");

        assertCommonMarkers(document);
        assertThat(document.select("label[for=firstName]")).hasSize(1);
        assertThat(document.select("label[for=surname]")).hasSize(1);
        assertThat(document.select("label[for=email]")).hasSize(1);
        assertThat(document.select("label[for=uid]")).hasSize(1);
    }

    @Test
    void managerHomeExposesLanguageSkipLinkAndMainLandmark() throws Exception {
        MvcResult result = mockMvc.perform(get("/manager/home")
                        .locale(Locale.FRENCH)
                        .with(user("superuser").roles("SUPERUSER")))
                .andExpect(status().isOk())
                .andReturn();

        Document document = Jsoup.parse(result.getResponse().getContentAsString());
        assertCommonMarkers(document);
    }

    private Document getDocument(String path) throws Exception {
        MvcResult result = mockMvc.perform(get(path).locale(Locale.FRENCH))
                .andExpect(status().isOk())
                .andReturn();
        return Jsoup.parse(result.getResponse().getContentAsString());
    }

    private void assertCommonMarkers(Document document) {
        assertThat(document.selectFirst("html")).isNotNull();
        assertThat(document.selectFirst("html").attr("lang")).isNotBlank();
        assertThat(document.select("a.skip-link[href=#main-content]")).hasSize(1);
        assertThat(document.select("main#main-content[tabindex=-1]")).hasSize(1);
        assertThat(document.select("main h1")).hasSize(1);
    }
}
