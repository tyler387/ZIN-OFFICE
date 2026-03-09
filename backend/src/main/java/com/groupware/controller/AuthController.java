package com.groupware.controller;

import com.groupware.dto.request.LoginRequest;
import com.groupware.dto.request.RefreshRequest;
import com.groupware.dto.response.AuthResponse;
import com.groupware.dto.response.RefreshResponse;
import com.groupware.dto.response.UserDto;
import com.groupware.global.response.ApiResponse;
import com.groupware.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 로그인
     */
    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ApiResponse.success(response, "로그인 성공");
    }

    /**
     * 토큰 갱신
     */
    @PostMapping("/refresh")
    public ApiResponse<RefreshResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        RefreshResponse response = authService.refresh(request.getRefreshToken());
        return ApiResponse.success(response, "토큰 갱신 성공");
    }

    /**
     * 내 정보 조회
     */
    @GetMapping("/me")
    public ApiResponse<UserDto> getMe(@AuthenticationPrincipal User principal) {
        UserDto response = authService.getMe(principal.getUsername()); // principal.getUsername() returns email
        return ApiResponse.success(response);
    }

    /**
     * 로그아웃 (서버 무상태이므로 응답만 줌)
     */
    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        // 클라이언트에서 토큰을 삭제하도록 처리 메시지만 반환
        return ApiResponse.success(null, "로그아웃 성공");
    }
}
