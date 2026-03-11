package com.groupware.dto.response;

import com.groupware.domain.Employee;
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
    private EmployeeInfoDto employee;

    @Getter
    @Builder
    public static class EmployeeInfoDto {
        private Long id;
        private String position;
        private DepartmentDto department;
        private String phone;
        private String officeLocation;
    }

    @Getter
    @Builder
    public static class DepartmentDto {
        private Long id;
        private String name;
    }

    public static UserDto from(User user) {
        EmployeeInfoDto employeeInfoDto = null;
        if (user.getEmployee() != null) {
            Employee emp = user.getEmployee();
            employeeInfoDto = EmployeeInfoDto.builder()
                    .id(emp.getId())
                    .position(emp.getPosition())
                    .department(DepartmentDto.builder()
                            .id(emp.getDepartment().getId())
                            .name(emp.getDepartment().getName())
                            .build())
                    .phone(emp.getPhone())
                    .officeLocation(emp.getOfficeLocation())
                    .build();
        }

        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .employee(employeeInfoDto)
                .build();
    }
}
