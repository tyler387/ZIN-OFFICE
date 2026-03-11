package com.groupware.global.config;

import com.groupware.domain.Department;
import com.groupware.domain.Employee;
import com.groupware.domain.Role;
import com.groupware.domain.User;
import com.groupware.repository.DepartmentRepository;
import com.groupware.repository.EmployeeRepository;
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
@Profile("!prod")
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.count() > 0) {
            log.info("Test data already exists");
            return;
        }

        Department management = createDepartment("경영지원본부", null, 1);
        Department development = createDepartment("개발팀", null, 2);
        Department sales = createDepartment("영업팀", null, 3);

        createUser(
                "admin@company.com",
                "password123",
                "관리자",
                Role.ADMIN,
                management,
                "대리",
                "010-0000-0001",
                "본사 12층"
        );
        createUser(
                "hong@company.com",
                "password123",
                "홍길동",
                Role.USER,
                development,
                "주임",
                "010-1234-5678",
                "본사 12층"
        );
        createUser(
                "kim@company.com",
                "password123",
                "김철수",
                Role.USER,
                development,
                "대리",
                "010-0000-0002",
                "본사 12층"
        );
        createUser(
                "kimj@company.com",
                "password123",
                "김진환",
                Role.USER,
                development,
                "사원",
                "010-0000-0004",
                "본사 12층"
        );
        createUser(
                "lee@company.com",
                "password123",
                "이영희",
                Role.USER,
                sales,
                "대리",
                "010-0000-0003",
                "본사 9층"
        );

        log.info("Initialized demo users for local/render demo");
    }

    private Department createDepartment(String name, Department parentDept, int displayOrder) {
        Department department = Department.builder()
                .name(name)
                .parentDept(parentDept)
                .displayOrder(displayOrder)
                .build();
        return departmentRepository.save(department);
    }

    private void createUser(
            String email,
            String password,
            String name,
            Role role,
            Department department,
            String position,
            String phone,
            String officeLocation
    ) {
        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .name(name)
                .role(role)
                .build();
        userRepository.save(user);

        Employee employee = Employee.builder()
                .user(user)
                .department(department)
                .name(name)
                .position(position)
                .phone(phone)
                .officeLocation(officeLocation)
                .build();
        employeeRepository.save(employee);
    }
}
