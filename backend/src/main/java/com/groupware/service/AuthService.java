package com.groupware.service;

import com.groupware.domain.User;
import com.groupware.dto.request.LoginRequest;
import com.groupware.dto.response.AuthResponse;
import com.groupware.dto.response.RefreshResponse;
import com.groupware.dto.response.UserDto;
import com.groupware.global.exception.CustomException;
import com.groupware.global.exception.ErrorCode;
import com.groupware.global.jwt.JwtTokenProvider;
import com.groupware.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 로그인
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();

        // 1. 유저 조회
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND, "가입되지 않은 이메일입니다."));

        // 2. 비밀번호 검증
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_PASSWORD, "비밀번호가 일치하지 않습니다.");
        }

        // 3. 비활성화 유저 체크
        if (!user.isEnabled()) {
            throw new CustomException(ErrorCode.ACCESS_DENIED, "비활성화된 계정입니다.");
        }

        // 4. JWT 토큰 발급
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(UserDto.from(user))
                .build();
    }

    /**
     * 토큰 갱신
     */
    @Transactional(readOnly = true)
    public RefreshResponse refresh(String refreshToken) {
        // 1. 토큰 유효성 검증
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new CustomException(ErrorCode.INVALID_TOKEN, "유효하지 않거나 만료된 리프레시 토큰입니다.");
        }

        // 2. 토큰에서 유저 아이디 추출 및 유저 검증
        try {
            Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
            
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

            // 3. 새 액세스 토큰 발급
            String newAccessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());

            return new RefreshResponse(newAccessToken);
            
        } catch (Exception e) {
            log.error("토큰 갱신 중 오류 발생", e);
            throw new CustomException(ErrorCode.INVALID_TOKEN, "토큰 파싱에 실패했습니다.");
        }
    }

    /**
     * 내 정보 조회
     */
    @Transactional(readOnly = true)
    public UserDto getMe(String email) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
                
        return UserDto.from(user);
    }
}
