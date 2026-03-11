package com.groupware.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private LocalDate workDate;

    @Column(nullable = false)
    private LocalDateTime clockInTime;

    @Column
    private LocalDateTime clockOutTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status;

    @Builder
    public Attendance(Employee employee, LocalDate workDate, LocalDateTime clockInTime, LocalDateTime clockOutTime, AttendanceStatus status) {
        this.employee = employee;
        this.workDate = workDate;
        this.clockInTime = clockInTime;
        this.clockOutTime = clockOutTime;
        this.status = status;
    }

    public void clockOut(LocalDateTime clockOutTime) {
        this.clockOutTime = clockOutTime;
    }
}
