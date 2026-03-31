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

package org.georchestra.console.mailservice;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.AddressException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.ServletContext;

import org.apache.commons.io.FileUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.georchestra.commons.configuration.GeorchestraConfiguration;
import org.springframework.context.i18n.LocaleContextHolder;

public class Email {

    protected static final Log LOG = LogFactory.getLog(Email.class.getName());

    private String smtpHost;
    private int smtpPort;
    private boolean emailHtml;
    private String replyTo;
    private String from;
    private String bodyEncoding;
    private String subjectEncoding;
    private String templateEncoding;
    private List<String> recipients;
    private String subject;
    private String emailBody;

    private String publicUrl;
    private String instanceName;
    private GeorchestraConfiguration georConfig;
    private ServletContext servletContext;

    public Email(List<String> recipients, String emailSubject, String smtpHost, int smtpPort, boolean emailHtml,
            String replyTo, String from, String bodyEncoding, String subjectEncoding, String templateEncoding,
            String fileTemplate, ServletContext servletContext, GeorchestraConfiguration georConfig, String publicUrl,
            String instanceName) {

        this.recipients = recipients;
        this.subject = emailSubject;
        this.smtpHost = smtpHost;
        this.smtpPort = smtpPort;
        this.emailHtml = emailHtml;
        this.replyTo = replyTo;
        this.from = from;
        this.bodyEncoding = bodyEncoding;
        this.subjectEncoding = subjectEncoding;
        this.templateEncoding = templateEncoding;
        this.georConfig = georConfig;
        this.publicUrl = publicUrl;
        this.instanceName = instanceName;
        this.servletContext = servletContext;
        // Load template from filesystem
        this.emailBody = this.loadBody(fileTemplate);
    }

    public void set(String key, String value) {
        this.emailBody = this.emailBody.replaceAll("\\{" + key + "\\}", value);
    }

    @Override
    public String toString() {
        return "Email{" + "smtpHost='" + smtpHost + '\'' + ", smtpPort=" + smtpPort + ", emailHtml='" + emailHtml + '\''
                + ", replyTo='" + replyTo + '\'' + ", from='" + from + '\'' + ", bodyEncoding='" + bodyEncoding + '\''
                + ", subjectEncoding='" + subjectEncoding + '\'' + ", recipients="
                + recipients.stream().collect(Collectors.joining(",")) + ", subject='" + subject + '\''
                + ", emailBody='" + emailBody + '\'' + '}';
    }

    /**
     * Loads the body template.
     *
     * if available, the templates will be resolved from the geOrchestra datadir,
     * and if not defined, a one inside the webapp will be used.
     *
     * @param fileName the filename to open, without the path to it.
     * @return
     * @throws IOException
     */
    private String loadBody(final String fileName) {
        if (fileName == null || fileName.isBlank()) {
            throw new IllegalStateException("Mail template file is not configured");
        }
        Locale locale = LocaleContextHolder.getLocale();
        List<String> candidateTemplates = resolveTemplateCandidates(fileName, locale);
        if (LOG.isDebugEnabled()) {
            LOG.debug("Resolving mail template '" + fileName + "' for locale " + locale
                    + ", candidates=" + candidateTemplates);
        }

        if ((georConfig != null) && (georConfig.activated())) {
            for (String candidate : candidateTemplates) {
                File fileTmpl = Paths.get(georConfig.getContextDataDir(), "templates", candidate).toFile();
                if (LOG.isDebugEnabled()) {
                    LOG.debug("Trying mail template from datadir: " + fileTmpl.getAbsolutePath());
                }
                if (fileTmpl.isFile()) {
                    try {
                        if (LOG.isDebugEnabled()) {
                            LOG.debug("Using mail template from datadir: " + fileTmpl.getAbsolutePath());
                        }
                        return FileUtils.readFileToString(fileTmpl, templateEncoding);
                    } catch (IOException e) {
                        LOG.error("Unable to get the template '" + candidate + "' from geOrchestra datadir.", e);
                    }
                }
            }
        }
        for (String candidate : candidateTemplates) {
            if (LOG.isDebugEnabled()) {
                LOG.debug("Trying mail template from classpath: /mail-templates/" + candidate);
            }
            try (InputStream classpathTemplate = Email.class.getResourceAsStream("/mail-templates/" + candidate)) {
                if (classpathTemplate != null) {
                    if (LOG.isDebugEnabled()) {
                        LOG.debug("Using mail template from classpath: /mail-templates/" + candidate);
                    }
                    return new String(classpathTemplate.readAllBytes(), Charset.forName(templateEncoding));
                }
            } catch (IOException e) {
                LOG.error("Unable to load the template '" + candidate + "' from classpath resources.", e);
            }
        }
        /* Trying to resolve the templates from inside the webapp */
        if (this.servletContext == null) {
            throw new IllegalStateException("Mail template '" + fileName + "' not found in datadir or classpath");
        }
        for (String candidate : candidateTemplates) {
            String tmplFromWebapp = this.servletContext.getRealPath(Paths.get("/WEB-INF", "templates", candidate).toString());
            if (tmplFromWebapp == null) {
                if (LOG.isDebugEnabled()) {
                    LOG.debug("Mail template not resolvable from webapp path for candidate: " + candidate);
                }
                continue;
            }
            if (LOG.isDebugEnabled()) {
                LOG.debug("Trying mail template from webapp: " + tmplFromWebapp);
            }
            try {
                File templateFile = new File(tmplFromWebapp);
                if (templateFile.isFile()) {
                    if (LOG.isDebugEnabled()) {
                        LOG.debug("Using mail template from webapp: " + tmplFromWebapp);
                    }
                    return FileUtils.readFileToString(templateFile, templateEncoding);
                }
            } catch (IOException e) {
                LOG.error("Unable to load the template '" + candidate + "' from webapp resources.", e);
            }
        }
        LOG.warn("No mail template found for '" + fileName + "' and locale " + locale
                + ". Tried candidates " + candidateTemplates);
        throw new IllegalStateException("Mail template '" + fileName + "' not found for locale "
                + locale);
    }

    private List<String> resolveTemplateCandidates(String fileName, Locale locale) {
        List<String> candidates = new ArrayList<>();
        String language = locale == null ? "" : locale.getLanguage();
        String country = locale == null ? "" : locale.getCountry();
        int extensionIndex = fileName.lastIndexOf('.');
        String baseName = extensionIndex >= 0 ? fileName.substring(0, extensionIndex) : fileName;
        String extension = extensionIndex >= 0 ? fileName.substring(extensionIndex) : "";

        if (!language.isBlank() && !country.isBlank()) {
            candidates.add(baseName + "_" + language + "_" + country + extension);
        }
        if (!language.isBlank()) {
            candidates.add(baseName + "_" + language + extension);
        }
        candidates.add(fileName);
        return candidates;
    }

    public MimeMessage send() throws MessagingException {
        return this.send(true);
    }

    public MimeMessage send(boolean reallySend) throws MessagingException {

        // Replace {publicUrl} token with the configured public URL
        this.emailBody = this.emailBody.replaceAll("\\{publicUrl\\}", publicUrl);
        this.emailBody = this.emailBody.replaceAll("\\{instanceName\\}", instanceName);
        LOG.debug("body: " + this.emailBody);

        final Session session = Session.getInstance(System.getProperties(), null);
        session.getProperties().setProperty("mail.smtp.host", smtpHost);
        session.getProperties().setProperty("mail.smtp.port", Integer.toString(smtpPort));

        final MimeMessage message = new MimeMessage(session);

        if (isValidEmailAddress(from)) {
            message.setFrom(new InternetAddress(from));
        }
        InternetAddress[] recipientAddress = new InternetAddress[recipients.size()];
        int counter = 0;
        for (String recipient : recipients) {
            if (!isValidEmailAddress(recipient))
                throw new AddressException("Invalid recipient : " + recipient);
            recipientAddress[counter] = new InternetAddress(recipient.trim());
            counter++;
        }
        message.setRecipients(Message.RecipientType.TO, recipientAddress);
        if (isValidEmailAddress(replyTo)) {
            message.setReplyTo(new InternetAddress[] { new InternetAddress(replyTo) });
        }

        message.setSubject(subject, subjectEncoding);

        if (this.emailBody != null) {
            if (emailHtml) {
                message.setContent(this.emailBody, "text/html; charset=" + bodyEncoding);
            } else {
                message.setContent(this.emailBody, "text/plain; charset=" + bodyEncoding);
            }
        }

        // Finally send the message
        if (reallySend)
            Transport.send(message);
        LOG.debug("email has been sent to:\n" + recipients.stream().collect(Collectors.joining(",")));
        return message;
    }

    private static boolean isValidEmailAddress(String address) {
        if (address == null) {
            return false;
        }

        boolean hasCharacters = address.trim().length() > 0;
        boolean hasAt = address.contains("@");

        if (!hasCharacters || !hasAt)
            return false;

        String[] parts = address.trim().split("@", 2);

        boolean mainPartNotEmpty = parts[0].trim().length() > 0;
        boolean hostPartNotEmpty = parts[1].trim().length() > 0;
        return mainPartNotEmpty && hostPartNotEmpty;
    }

}
