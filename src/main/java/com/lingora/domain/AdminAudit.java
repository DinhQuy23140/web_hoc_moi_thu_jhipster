package com.lingora.domain;

import jakarta.persistence.*;
import java.time.Instant;

/** One admin write request (who, what, result). */
@Entity
@Table(name = "admin_audit")
public class AdminAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public Long actorId;
    public String actorLogin;
    public String method;
    public String path;
    public int status;
    public String ip;
    public Instant createdAt;
}
