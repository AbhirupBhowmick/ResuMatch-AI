package com.resumatch.exception;

import lombok.Getter;

@Getter
public class SubscriptionLimitExceededException extends RuntimeException {
    private final String error;

    public SubscriptionLimitExceededException(String message) {
        this("INSUFFICIENT_CREDITS", message);
    }

    public SubscriptionLimitExceededException(String error, String message) {
        super(message);
        this.error = error;
    }
}
