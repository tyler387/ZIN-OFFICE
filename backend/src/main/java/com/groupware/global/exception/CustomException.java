package com.groupware.global.exception;

import lombok.Getter;

/**
 * 비즈니스 로직에서 발생하는 커스텀 예외
 * ErrorCode를 기반으로 HTTP 상태코드와 메시지를 결정한다.
 */
@Getter
public class CustomException extends RuntimeException {

    private final ErrorCode errorCode;

    public CustomException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public CustomException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }
}
