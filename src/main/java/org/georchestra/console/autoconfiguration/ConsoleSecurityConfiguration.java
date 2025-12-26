package org.georchestra.console.autoconfiguration;

import org.georchestra.lib.springutils.GeorchestraUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.AuthenticationUserDetailsService;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationProvider;
import org.springframework.security.web.authentication.preauth.RequestHeaderAuthenticationFilter;

@Configuration
public class ConsoleSecurityConfiguration {

    public @Bean SecurityFilterChain securedFilterChain(HttpSecurity http, RequestHeaderAuthenticationFilter filter) {
        return http
                .addFilter(filter)
                .csrf(csrf -> csrf.disable())
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            PreAuthenticatedAuthenticationProvider authenticationProvider) {
        return new ProviderManager(authenticationProvider);
    }

    public @Bean RequestHeaderAuthenticationFilter preAuthenticationFilter(
            AuthenticationManager authenticationManager) {
        RequestHeaderAuthenticationFilter filter =  new RequestHeaderAuthenticationFilter();
        filter.setAuthenticationManager(authenticationManager);
        filter.setCheckForPrincipalChanges(true);
        filter.setExceptionIfHeaderMissing(false);
        filter.setPrincipalRequestHeader("sec-username");
        return filter;
    }

    public @Bean PreAuthenticatedAuthenticationProvider preAuthenticatedAuthenticationProvider(
            AuthenticationUserDetailsService userDetailsService) {
        PreAuthenticatedAuthenticationProvider authenticationProvider =
                new PreAuthenticatedAuthenticationProvider();
        authenticationProvider.setPreAuthenticatedUserDetailsService(userDetailsService);
        return authenticationProvider;
    }

    public @Bean AuthenticationUserDetailsService georchestraUserDetailsService() {
        return new GeorchestraUserDetailsService();

    }
}
