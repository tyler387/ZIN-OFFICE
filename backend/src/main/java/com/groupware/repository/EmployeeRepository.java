package com.groupware.repository;

import com.groupware.domain.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    
    @Query("SELECT e FROM Employee e JOIN FETCH e.user JOIN FETCH e.department WHERE e.department.id = :deptId")
    List<Employee> findByDepartmentIdWithDeptAndUser(@Param("deptId") Long deptId);

    @Query("SELECT e FROM Employee e JOIN FETCH e.user JOIN FETCH e.department")
    List<Employee> findAllWithDeptAndUser();

    @Query("SELECT e FROM Employee e JOIN FETCH e.user u JOIN FETCH e.department d WHERE LOWER(e.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Employee> searchByNameOrEmail(@Param("keyword") String keyword);
}
