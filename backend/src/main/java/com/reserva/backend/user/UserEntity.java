package com.reserva.backend.user;

import com.reserva.backend.common.model.UserRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    @Column(length = 36, nullable = false)
    private String id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "google_subject", unique = true)
    private String googleSubject;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public static UserEntity create(String id,
                                    String email,
                                    String passwordHash,
                                    String googleSubject,
                                    String displayName,
                                    UserRole role,
                                    String profileImageUrl,
                                    LocalDateTime now) {
        UserEntity user = new UserEntity();
        user.id = id;
        user.email = email;
        user.passwordHash = passwordHash;
        user.googleSubject = googleSubject;
        user.displayName = displayName;
        user.role = role;
        user.profileImageUrl = profileImageUrl;
        user.createdAt = now;
        user.updatedAt = now;
        return user;
    }

    public String getId() {
        return id;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getGoogleSubject() {
        return googleSubject;
    }

    public UserRole getRole() {
        return role;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void refreshSeedProfile(String passwordHash,
                                   String googleSubject,
                                   String displayName,
                                   UserRole role,
                                   String profileImageUrl,
                                    LocalDateTime now) {
        this.passwordHash = passwordHash;
        this.googleSubject = googleSubject;
        this.displayName = displayName;
        this.role = role;
        this.profileImageUrl = profileImageUrl;
        this.updatedAt = now;
    }

    public void linkGoogleSubject(String googleSubject, LocalDateTime now) {
        this.googleSubject = googleSubject;
        this.updatedAt = now;
    }
}
