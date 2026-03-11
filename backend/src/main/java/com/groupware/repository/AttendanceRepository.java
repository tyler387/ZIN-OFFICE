package com.groupware.repository;

import com.groupware.domain.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    
    @Query("SELECT a FROM Attendance a JOIN FETCH a.employee e JOIN FETCH e.user u WHERE u.id = :userId AND a.workDate = :workDate")
    Optional<Attendance> findByUserIdAndWorkDate(@Param("userId") Long userId, @Param("workDate") LocalDate workDate);
}
