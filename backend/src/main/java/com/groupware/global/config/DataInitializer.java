package com.groupware.global.config;

import com.groupware.domain.Role;
import com.groupware.domain.User;
import com.groupware.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Profile("!prod") // 운영(prod) 환경에서는 실행하지 않음
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        log.info("=== 테스트용 더미 데이터 초기화를 시작합니다 ===");

        createTestUser("admin@company.com", "password123", "관리자", Role.ADMIN);
        createTestUser("hong@company.com", "password123", "홍길동", Role.USER);
        createTestUser("kim@company.com", "password123", "김철수", Role.USER);

        log.info("=== 더미 데이터 초기화 완료 ===");
    }

    private void createTestUser(String email, String password, String name, Role role) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User user = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .name(name)
                    .role(role)
                    .build();
            userRepository.save(user);
            log.info("테스트 사용자 생성 완료: email={}, name={}, role={}", email, name, role);
        } else {
            log.info("테스트 사용자 이미 존재: email={}", email);
        }
    }
}
