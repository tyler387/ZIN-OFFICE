package com.groupware.dto.response.org;

import com.groupware.domain.Employee;
import com.groupware.domain.EmployeeStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class EmployeeDto {
    private Long id;
    private String name;
    private String position;
    private DepartmentDto department;
    private String email;
    private String phone;
    private EmployeeStatus status;

    @Getter
    @Builder
    public static class DepartmentDto {
        private Long id;
        private String name;
    }

    public static EmployeeDto from(Employee employee) {
        return EmployeeDto.builder()
                .id(employee.getId())
                .name(employee.getName())
                .position(employee.getPosition())
                .department(DepartmentDto.builder()
                        .id(employee.getDepartment().getId())
                        .name(employee.getDepartment().getName())
                        .build())
                .email(employee.getUser().getEmail())
                .phone(employee.getPhone())
                .status(employee.getStatus())
                .build();
    }
}
