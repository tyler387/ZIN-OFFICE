package com.groupware.global.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * API 공통 응답 래퍼
 * 모든 REST API 응답은 이 형식을 따른다.
 *
 * {
 *   "success": true,
 *   "data": { ... },
 *   "message": "ok"
 * }
 */
@Getter
@Builder
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final boolean success;
    private final T data;
    private final String message;

    // === 성공 응답 ===

    /** 데이터 포함 성공 응답 */
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message("ok")
                .build();
    }

    /** 메시지만 포함 성공 응답 */
    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message(message)
                .build();
    }

    /** 데이터 없는 성공 응답 */
    public static ApiResponse<Void> ok() {
        return ApiResponse.<Void>builder()
                .success(true)
                .message("ok")
                .build();
    }

    // === 실패 응답 ===

    /** 에러 응답 */
    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .build();
    }
}
