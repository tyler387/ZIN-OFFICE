package com.groupware.repository;

import com.groupware.domain.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    
    @Query("SELECT a FROM Attendance a JOIN FETCH a.employee e JOIN FETCH e.user u WHERE u.id = :userId AND a.workDate = :workDate")
    Optional<Attendance> findByUserIdAndWorkDate(@Param("userId") Long userId, @Param("workDate") LocalDate workDate);

    @Query("SELECT a FROM Attendance a JOIN FETCH a.employee e JOIN FETCH e.user u WHERE u.id = :userId AND a.workDate BETWEEN :startDate AND :endDate ORDER BY a.workDate ASC")
    List<Attendance> findByUserIdAndWorkDateBetween(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
