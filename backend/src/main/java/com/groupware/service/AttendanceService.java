package com.groupware.service;

import com.groupware.domain.Attendance;
import com.groupware.domain.AttendanceStatus;
import com.groupware.domain.Employee;
import com.groupware.domain.User;
import com.groupware.dto.response.AttendanceDto;
import com.groupware.global.exception.CustomException;
import com.groupware.global.exception.ErrorCode;
import com.groupware.repository.AttendanceRepository;
import com.groupware.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    // 출근 기준 시간: 오전 9시
    private static final LocalTime ON_TIME_LIMIT = LocalTime.of(9, 0);

    /**
     * 출근 처리
     */
    @Transactional
    public AttendanceDto clockIn(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다."));

        Employee employee = user.getEmployee();
        if (employee == null) {
            throw new CustomException(ErrorCode.USER_NOT_FOUND, "직원 정보가 없습니다.");
        }

        LocalDate today = LocalDate.now();
        
        // 이미 출근 기록이 있는지 확인
        if (attendanceRepository.findByUserIdAndWorkDate(userId, today).isPresent()) {
            throw new CustomException(ErrorCode.INVALID_INPUT, "이미 출근 처리가 되었습니다.");
        }

        LocalDateTime now = LocalDateTime.now();
        AttendanceStatus status = now.toLocalTime().isAfter(ON_TIME_LIMIT) ? 
                AttendanceStatus.LATE : AttendanceStatus.PRESENT;

        Attendance attendance = Attendance.builder()
                .employee(employee)
                .workDate(today)
                .clockInTime(now)
                .status(status)
                .build();

        Attendance saved = attendanceRepository.save(attendance);
        return AttendanceDto.from(saved);
    }

    /**
     * 퇴근 처리
     */
    @Transactional
    public AttendanceDto clockOut(Long userId) {
        LocalDate today = LocalDate.now();
        
        Attendance attendance = attendanceRepository.findByUserIdAndWorkDate(userId, today)
                .orElseThrow(() -> new CustomException(ErrorCode.INVALID_INPUT, "오늘의 출근 기록이 없습니다."));

        if (attendance.getClockOutTime() != null) {
            throw new CustomException(ErrorCode.INVALID_INPUT, "이미 퇴근 처리가 되었습니다.");
        }

        attendance.clockOut(LocalDateTime.now());
        // Dirty checking에 의해 자동 update 됨
        return AttendanceDto.from(attendance);
    }

    /**
     * 오늘의 내 근태 기록 조회
     */
    public AttendanceDto getTodayAttendance(Long userId) {
        LocalDate today = LocalDate.now();
        return attendanceRepository.findByUserIdAndWorkDate(userId, today)
                .map(AttendanceDto::from)
                .orElse(null); // 기록이 없으면 null 반환
    }
}
