package com.groupware.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "employee")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String position;

    @Column
    private String phone;

    @Column(name = "office_location")
    private String officeLocation;

    @Column(name = "join_date")
    private LocalDate joinDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmployeeStatus status;

    @Builder
    public Employee(User user, Department department, String name, String position, String phone, String officeLocation, LocalDate joinDate, EmployeeStatus status) {
        this.user = user;
        this.department = department;
        this.name = name;
        this.position = position;
        this.phone = phone;
        this.officeLocation = officeLocation;
        this.joinDate = joinDate;
        this.status = status != null ? status : EmployeeStatus.ACTIVE;
    }
}
