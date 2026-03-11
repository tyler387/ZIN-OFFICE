package com.groupware.dto.response;

import com.groupware.domain.Attendance;
import com.groupware.domain.AttendanceStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class AttendanceDto {
    private Long id;
    private LocalDate workDate;
    private LocalDateTime clockInTime;
    private LocalDateTime clockOutTime;
    private AttendanceStatus status;

    public static AttendanceDto from(Attendance attendance) {
        if (attendance == null) return null;
        return AttendanceDto.builder()
                .id(attendance.getId())
                .workDate(attendance.getWorkDate())
                .clockInTime(attendance.getClockInTime())
                .clockOutTime(attendance.getClockOutTime())
                .status(attendance.getStatus())
                .build();
    }
}
