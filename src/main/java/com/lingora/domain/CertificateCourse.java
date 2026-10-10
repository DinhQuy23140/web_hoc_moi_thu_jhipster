package com.lingora.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

/** Extra course recommended for a certificate (besides courses whose certificateId points to it). */
@Entity
@Table(name = "certificate_course")
@IdClass(CertificateCourse.Key.class)
public class CertificateCourse {

    @Id
    public String certificateId;

    @Id
    public String courseId;

    public CertificateCourse() {}

    public CertificateCourse(String certificateId, String courseId) {
        this.certificateId = certificateId;
        this.courseId = courseId;
    }

    public static class Key implements Serializable {

        public String certificateId;
        public String courseId;

        @Override
        public boolean equals(Object o) {
            return o instanceof Key k && Objects.equals(certificateId, k.certificateId) && Objects.equals(courseId, k.courseId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(certificateId, courseId);
        }
    }
}
