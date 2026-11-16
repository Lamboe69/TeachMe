package ug.tutorug.api.config;

import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Externalised application settings, bound from the {@code app.*} keys in
 * {@code application.yml}. Everything has a safe default so the API starts with
 * zero configuration for local development.
 */
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    /** Platform commission taken from each completed session (percent). */
    private int platformFeePercent = 10;

    /** Zone used for "is this session in the future?" checks on wall-clock times. */
    private String timeZone = "Africa/Kampala";

    private final Jwt jwt = new Jwt();
    private final Cors cors = new Cors();
    private final Seed seed = new Seed();

    public int getPlatformFeePercent() {
        return platformFeePercent;
    }

    public void setPlatformFeePercent(int platformFeePercent) {
        this.platformFeePercent = platformFeePercent;
    }

    public String getTimeZone() {
        return timeZone;
    }

    public void setTimeZone(String timeZone) {
        this.timeZone = timeZone;
    }

    public Jwt getJwt() {
        return jwt;
    }

    public Cors getCors() {
        return cors;
    }

    public Seed getSeed() {
        return seed;
    }

    public static class Jwt {
        private String secret = "tutorug-development-secret-change-me-please-1234567890";
        private long expirationMinutes = 1440;
        private String issuer = "tutorug";

        public String getSecret() {
            return secret;
        }

        public void setSecret(String secret) {
            this.secret = secret;
        }

        public long getExpirationMinutes() {
            return expirationMinutes;
        }

        public void setExpirationMinutes(long expirationMinutes) {
            this.expirationMinutes = expirationMinutes;
        }

        public String getIssuer() {
            return issuer;
        }

        public void setIssuer(String issuer) {
            this.issuer = issuer;
        }
    }

    public static class Cors {
        private List<String> allowedOrigins = new ArrayList<>();

        public List<String> getAllowedOrigins() {
            return allowedOrigins;
        }

        public void setAllowedOrigins(List<String> allowedOrigins) {
            this.allowedOrigins = allowedOrigins;
        }
    }

    public static class Seed {
        private boolean enabled = true;

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }
    }
}
