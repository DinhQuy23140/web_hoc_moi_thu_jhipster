package com.lingora.service.content;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class ContentValidationException extends RuntimeException {

    public ContentValidationException(String message) {
        super(message);
    }
}
