package org.georchestra.console.ws.security.api;

import org.georchestra.console.boot.ConsoleApplicationTests;
import org.georchestra.security.model.GeorchestraUser;
import org.georchestra.security.model.Organization;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.client.RestTestClient;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

@AutoConfigureRestTestClient
public class SecurityApiControllerIT extends ConsoleApplicationTests {

    @Autowired
    private RestTestClient restTestClient;

    @Test
    public void testFindUsers() throws Exception {
        restTestClient.get().uri("/internal/users")
                .exchange()
                .expectStatus().isOk()
                .expectBody(List.class)
                .consumeWith(result -> {
                    assertTrue(result.getResponseBody().size() > 0,
                            "No users being returned from a default geOrchestra LDAP, " +
                                    "expecting ~ 6 users ('test*...').");
                });
    }

    @Test
    public void testFindTestAdminUserById() throws Exception {
        // See https://github.com/georchestra/georchestra/blob/master/ldap/docker-root/georchestra.ldif#L84
        // to get the uuid being passed to the rest client.
        restTestClient.get().uri("/internal/users/id/0c6bb556-4ee8-46f2-892d-6116e262b489")
                .exchange()
                .expectStatus().isOk()
                .expectBody(GeorchestraUser.class)
                .consumeWith(result -> {
                    GeorchestraUser testadmin = result.getResponseBody();
                    assertTrue(testadmin.getUsername().equals("testadmin"));
                });
    }

    @Test
    public void testFindTestAdminUser() throws Exception {
        restTestClient.get().uri("/internal/users/username/testadmin")
                .exchange()
                .expectStatus().isOk()
                .expectBody(GeorchestraUser.class)
                .consumeWith(result -> {
                    GeorchestraUser testadmin = result.getResponseBody();
                    assertTrue(testadmin.getUsername().equals("testadmin"));
                });
    }

    @Test
    public void testFindOrgs() throws Exception {
        restTestClient.get().uri("/internal/organizations")
                .exchange()
                .expectStatus().isOk()
                .expectBody(List.class)
                .consumeWith(result -> {
                    assertTrue(result.getResponseBody().size() > 0,
                            "No orgs being returned from a default geOrchestra LDAP, " +
                                    "expecting ~ 2 ('PSC, C2C').");
                });
    }

    @Test
    public void testFindOrgById() throws Exception {
        // https://github.com/georchestra/georchestra/blob/master/ldap/docker-root/georchestra.ldif#L333C30-L333C66
        restTestClient.get().uri("/internal/organizations/id/bddf474d-125d-4b18-92bd-bd8ebb6699a9")
                .exchange()
                .expectStatus().isOk()
                .expectBody(Organization.class)
                .consumeWith(result -> {
                    assertTrue(result.getResponseBody().getShortName().equals("PSC"),
                            "'PSC' organization not found in the default geOrchestra LDAP" );
                });
    }

    @Test
    public void testFindOrgLogoById() throws Exception {
        // https://github.com/georchestra/georchestra/blob/master/ldap/docker-root/georchestra.ldif#L333C30-L333C66
        restTestClient.get().uri("/internal/organizations/id/bddf474d-125d-4b18-92bd-bd8ebb6699a9/logo")
                .accept(MediaType.APPLICATION_OCTET_STREAM)
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .consumeWith(result -> {
                    byte[] b = result.getResponseBody();
                    assertTrue(b[0] == -1    // 0xff
                                    && b[1] == -40    // 0xd8
                                    && b[2] == -1     // 0xff
                                    && b[3] == -32,   // these are JPEG magic numbers
                            "'PSC' logo in the default geOrchestra LDAP does not look like a JPEG" );
                });
    }

    @Test
    public void testFindOrgByShortName() throws Exception {
        restTestClient.get().uri("/internal/organizations/shortname/PSC")
                .exchange()
                .expectStatus().isOk()
                .expectBody(Organization.class)
                .consumeWith(result -> {
                    assertTrue(result.getResponseBody().getShortName().equals("PSC"),
                            "'PSC' organization not found in the default geOrchestra LDAP" );
                });
    }

    @Test
    public void testFindRoles() throws Exception {
        restTestClient.get().uri("/internal/roles")
                .exchange()
                .expectStatus().isOk()
                .expectBody(List.class)
                .consumeWith(result -> {
                    assertTrue(result.getResponseBody().size() > 0,
                            "No roles being returned from a default geOrchestra LDAP, " +
                                    "expecting ~ 11");
                });
    }

}
