package com.lingora.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "account_lock")
public class AccountLock {

    @Id
    @Column(name = "user_id")
    public Long userId;

    @Column(name = "reason", length = 500)
    public String reason;

    @Column(name = "locked_by", length = 254)
    public String lockedBy;

    @Column(name = "locked_at", nullable = false)
    public Instant lockedAt;
}
