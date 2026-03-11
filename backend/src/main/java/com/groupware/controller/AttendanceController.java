package com.groupware.controller;

import com.groupware.dto.response.AttendanceDto;
import com.groupware.global.jwt.JwtTokenProvider;
import com.groupware.service.AttendanceService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final JwtTokenProvider jwtTokenProvider;

    private Long getUserIdFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            return jwtTokenProvider.getUserIdFromToken(token);
        }
        return null; // 예외 처리는 필터 등에서 이미 됨
    }

    /**
     * 출근 기록
     */
    @PostMapping("/clock-in")
    public ResponseEntity<AttendanceDto> clockIn(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(attendanceService.clockIn(userId));
    }

    /**
     * 퇴근 기록
     */
    @PostMapping("/clock-out")
    public ResponseEntity<AttendanceDto> clockOut(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(attendanceService.clockOut(userId));
    }

    /**
     * 오늘의 내 출퇴근 기록 조회
     */
    @GetMapping("/today")
    public ResponseEntity<AttendanceDto> getTodayAttendance(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        AttendanceDto dto = attendanceService.getTodayAttendance(userId);
        if (dto != null) {
            return ResponseEntity.ok(dto);
        }
        return ResponseEntity.noContent().build();
    }
}
