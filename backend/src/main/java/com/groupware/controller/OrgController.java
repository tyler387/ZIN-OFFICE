package com.groupware.controller;

import com.groupware.dto.response.org.DepartmentNodeDto;
import com.groupware.dto.response.org.EmployeeDetailDto;
import com.groupware.dto.response.org.EmployeeDto;
import com.groupware.dto.response.org.EmployeeSearchDto;
import com.groupware.service.OrgService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/org")
@RequiredArgsConstructor
public class OrgController {

    private final OrgService orgService;

    /**
     * 부서 트리 조회
     */
    @GetMapping("/departments")
    public ResponseEntity<List<DepartmentNodeDto>> getDepartmentTree() {
        return ResponseEntity.ok(orgService.getDepartmentTree());
    }

    /**
     * 직원 목록 조회
     * deptId 파라미터가 없으면 전체 직원 조회
     */
    @GetMapping("/employees")
    public ResponseEntity<List<EmployeeDto>> getEmployees(@RequestParam(required = false) Long deptId) {
        return ResponseEntity.ok(orgService.getEmployeesByDepartment(deptId));
    }

    /**
     * 직원 상세 조회
     */
    @GetMapping("/employees/{id}")
    public ResponseEntity<EmployeeDetailDto> getEmployeeDetail(@PathVariable Long id) {
        return ResponseEntity.ok(orgService.getEmployeeDetail(id));
    }

    /**
     * 직원 검색
     */
    @GetMapping("/employees/search")
    public ResponseEntity<List<EmployeeSearchDto>> searchEmployees(@RequestParam String q) {
        return ResponseEntity.ok(orgService.searchEmployees(q));
    }
}
