package com.groupware.dto.response;

import com.groupware.domain.Role;
import com.groupware.domain.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserDto {
    private Long id;
    private String email;
    private String name;
    private Role role;
    private String department;
    private String position;

    public static UserDto from(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                // TODO: Entity에 부서, 직급 필드 추가 시 매핑
                .department("개발팀")
                .position("사원")
                .build();
    }
}
