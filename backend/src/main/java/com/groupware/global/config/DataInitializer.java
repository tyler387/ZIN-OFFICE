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

        Department management = createDepartment("Management", null, 1);
        Department development = createDepartment("Development", null, 2);
        Department sales = createDepartment("Sales", null, 3);

        createUser(
                "admin@company.com",
                "password123",
                "Admin",
                Role.ADMIN,
                management,
                "Manager",
                "010-0000-0001",
                "HQ 12F"
        );
        createUser(
                "hong@company.com",
                "password123",
                "Hong Gildong",
                Role.USER,
                development,
                "Developer",
                "010-1234-5678",
                "HQ 12F"
        );
        createUser(
                "kim@company.com",
                "password123",
                "Kim Cheolsu",
                Role.USER,
                development,
                "Developer",
                "010-0000-0002",
                "HQ 12F"
        );
        createUser(
                "kimj@company.com",
                "password123",
                "Kim Jihwan",
                Role.USER,
                development,
                "Staff",
                "010-0000-0004",
                "HQ 12F"
        );
        createUser(
                "lee@company.com",
                "password123",
                "Lee Younghee",
                Role.USER,
                sales,
                "Staff",
                "010-0000-0003",
                "HQ 9F"
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
