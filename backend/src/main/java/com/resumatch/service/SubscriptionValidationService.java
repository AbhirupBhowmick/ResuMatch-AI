package com.resumatch.service;

import com.resumatch.exception.SubscriptionLimitExceededException;
import com.resumatch.model.SubscriptionTier;
import com.resumatch.model.User;
import org.springframework.stereotype.Service;

@Service
public class SubscriptionValidationService {

    public void validateAuditLimit(User user) {
        SubscriptionTier tier = user.getSubscriptionTier();
        int currentCount = user.getMonthlyAuditCount();

        switch (tier) {
            case FREE:
                // User is allowed 1 audit. Check if count >= 1 means they already USED their 1 free audit.
                // Request 1: "if a user has 0 audits in their history, they are ALWAYS allowed their first 'Free' audit"
                // This logic (currentCount >= 1) correctly allows the 0th one and blocks the 1st attempt *after* the 0th is recorded.
                if (currentCount >= 1) {
                    throw new SubscriptionLimitExceededException("INSUFFICIENT_CREDITS", "You have 0 audits left. Upgrade to Starter to continue.");
                }
                break;
            case STARTER:
                if (currentCount >= 5) {
                    throw new SubscriptionLimitExceededException("INSUFFICIENT_CREDITS", "5/5 scans used. Go Unlimited with Active Hunter!");
                }
                break;
            case ELITE:
                if (currentCount >= 999) {
                    throw new SubscriptionLimitExceededException("INSUFFICIENT_CREDITS", "You have 0 audits left. Elite limit reached.");
                }
                break;
            case ACTIVE_HUNTER:
            case PRO_ACHIEVER:
                // Unlimited Audits
                break;
        }
    }

    public void validateMcqLimit(User user) {
        SubscriptionTier tier = user.getSubscriptionTier();
        int currentCount = user.getMonthlyMcqCount();

        switch (tier) {
            case FREE:
                throw new SubscriptionLimitExceededException("INSUFFICIENT_CREDITS", "MCQ Generation is not available on the Free tier. Upgrade to Starter to unlock.");
            case STARTER:
                if (currentCount >= 5) {
                    throw new SubscriptionLimitExceededException("INSUFFICIENT_CREDITS", "Starter tier MCQ limit reached (5/month). Go Unlimited with Active Hunter!");
                }
                break;
            case ELITE:
                // Unlimited for Elite too
                break;
            case ACTIVE_HUNTER:
                // 10-Question MCQs
                break;
            case PRO_ACHIEVER:
                // Unlimited
                break;
        }
    }

    public void validatePremiumFeature(User user, SubscriptionTier minimumRequired) {
        SubscriptionTier userTier = user.getSubscriptionTier();
        
        if (userTier.ordinal() < minimumRequired.ordinal()) {
            throw new SubscriptionLimitExceededException("INSUFFICIENT_CREDITS", "This is a premium feature. Please upgrade your plan to " + minimumRequired.name() + " to gain access.");
        }
    }
}
