package com.lingora.config;

import com.github.benmanes.caffeine.jcache.configuration.CaffeineConfiguration;
import java.util.OptionalLong;
import java.util.concurrent.TimeUnit;
import org.hibernate.cache.jcache.ConfigSettings;
import org.springframework.boot.cache.autoconfigure.JCacheManagerCustomizer;
import org.springframework.boot.hibernate.autoconfigure.HibernatePropertiesCustomizer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tech.jhipster.config.JHipsterProperties;

@Configuration
@EnableCaching
public class CacheConfiguration {

    private final javax.cache.configuration.Configuration<Object, Object> jcacheConfiguration;

    public CacheConfiguration(JHipsterProperties jHipsterProperties) {
        JHipsterProperties.Cache.Caffeine caffeine = jHipsterProperties.getCache().getCaffeine();

        CaffeineConfiguration<Object, Object> caffeineConfiguration = new CaffeineConfiguration<>();
        caffeineConfiguration.setMaximumSize(OptionalLong.of(caffeine.getMaxEntries()));
        caffeineConfiguration.setExpireAfterWrite(OptionalLong.of(TimeUnit.SECONDS.toNanos(caffeine.getTimeToLiveSeconds())));
        caffeineConfiguration.setStatisticsEnabled(true);
        jcacheConfiguration = caffeineConfiguration;
    }

    @Bean
    public HibernatePropertiesCustomizer hibernatePropertiesCustomizer(javax.cache.CacheManager cacheManager) {
        return hibernateProperties -> hibernateProperties.put(ConfigSettings.CACHE_MANAGER, cacheManager);
    }

    @Bean
    public JCacheManagerCustomizer cacheManagerCustomizer() {
        return cm -> {
            createCache(cm, com.lingora.repository.UserRepository.USERS_BY_LOGIN_CACHE);
            createCache(cm, com.lingora.repository.UserRepository.USERS_BY_EMAIL_CACHE);
            createCache(cm, com.lingora.domain.User.class.getName());
            createCache(cm, com.lingora.domain.Authority.class.getName());
            createCache(cm, com.lingora.domain.User.class.getName() + ".authorities");
            createContentCache(cm);
            // jhipster-needle-caffeine-add-entry
        };
    }

    /** Assembled content documents: every lesson/exam/outline fits, evicted on admin writes. */
    private void createContentCache(javax.cache.CacheManager cm) {
        String name = com.lingora.service.content.ContentQueryService.CACHE;
        if (cm.getCache(name) != null) {
            cm.getCache(name).clear();
            return;
        }
        CaffeineConfiguration<Object, Object> config = new CaffeineConfiguration<>();
        config.setMaximumSize(OptionalLong.of(5_000));
        config.setExpireAfterWrite(OptionalLong.of(TimeUnit.HOURS.toNanos(6)));
        config.setStatisticsEnabled(true);
        // Documents are read-only once cached; skip the per-read serialization copy.
        config.setStoreByValue(false);
        cm.createCache(name, config);
    }

    private void createCache(javax.cache.CacheManager cm, String cacheName) {
        javax.cache.Cache<Object, Object> cache = cm.getCache(cacheName);
        if (cache != null) {
            cache.clear();
        } else {
            cm.createCache(cacheName, jcacheConfiguration);
        }
    }
}
