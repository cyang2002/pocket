package com.cardoptimizer.api.exception;

public class CardDataUnavailableException extends RuntimeException {
    public CardDataUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}