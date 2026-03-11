package com.groupware.dto.response.org;

import com.groupware.domain.Employee;
import com.groupware.domain.EmployeeStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class EmployeeDetailDto {
    private Long id;
    private String name;
    private String position;
    private EmployeeDto.DepartmentDto department;
    private String email;
    private String phone;
    private String officeLocation;
    private LocalDate joinDate;
    private EmployeeStatus status;

    public static EmployeeDetailDto from(Employee employee) {
        return EmployeeDetailDto.builder()
                .id(employee.getId())
                .name(employee.getName())
                .position(employee.getPosition())
                .department(EmployeeDto.DepartmentDto.builder()
                        .id(employee.getDepartment().getId())
                        .name(employee.getDepartment().getName())
                        .build())
                .email(employee.getUser().getEmail())
                .phone(employee.getPhone())
                .officeLocation(employee.getOfficeLocation())
                .joinDate(employee.getJoinDate())
                .status(employee.getStatus())
                .build();
    }
}
