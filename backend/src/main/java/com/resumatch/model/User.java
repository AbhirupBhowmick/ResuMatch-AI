package com.resumatch.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String name;
    
    private String industry;
    
    private String experienceLevel;

    @Column(nullable = false)
    @Builder.Default
    private boolean isPremium = false;

    @Builder.Default
    private String premiumPlan = "FREE";

    private LocalDate premiumExpiryDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SubscriptionTier subscriptionTier = SubscriptionTier.FREE;

    @Builder.Default
    @Column(nullable = false)
    private int monthlyAuditCount = 0;

    @Builder.Default
    @Column(nullable = false)
    private int monthlyMcqCount = 0;

    @Column(unique = true)
    private String apiKey;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String lastParsedResume;
}
