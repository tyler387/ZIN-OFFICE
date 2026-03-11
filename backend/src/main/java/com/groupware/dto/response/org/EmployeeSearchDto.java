package com.groupware.dto.response.org;

import com.groupware.domain.Employee;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class EmployeeSearchDto {
    private Long id;
    private String name;
    private String email;
    private DepartmentDto department;
    private String position;

    @Getter
    @Builder
    public static class DepartmentDto {
        private String name;
    }

    public static EmployeeSearchDto from(Employee employee) {
        return EmployeeSearchDto.builder()
                .id(employee.getId())
                .name(employee.getName())
                .email(employee.getUser().getEmail())
                .department(DepartmentDto.builder()
                        .name(employee.getDepartment().getName())
                        .build())
                .position(employee.getPosition())
                .build();
    }
}
