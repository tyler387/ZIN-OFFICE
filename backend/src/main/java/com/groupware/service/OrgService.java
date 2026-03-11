package com.groupware.service;

import com.groupware.domain.Department;
import com.groupware.domain.Employee;
import com.groupware.dto.response.org.DepartmentNodeDto;
import com.groupware.dto.response.org.EmployeeDetailDto;
import com.groupware.dto.response.org.EmployeeDto;
import com.groupware.dto.response.org.EmployeeSearchDto;
import com.groupware.global.exception.CustomException;
import com.groupware.global.exception.ErrorCode;
import com.groupware.repository.DepartmentRepository;
import com.groupware.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrgService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    /**
     * 부서 트리 조회
     * 루트(parentDept=null) 부서들을 찾고, 엔티티 필드의 @OneToMany children을 통해 트리 형태로 변환
     */
    public List<DepartmentNodeDto> getDepartmentTree() {
        List<Department> result = departmentRepository.findAllByOrderByDisplayOrderAsc();
        // 부모가 null인 루트 부서들만 필터링 후 DTO 변환 (내부에서 children 자동 매핑)
        return result.stream()
                .filter(dept -> dept.getParentDept() == null)
                .map(DepartmentNodeDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 특정 부서의 직원 목록 조회 (deptId가 null이면 전체)
     */
    public List<EmployeeDto> getEmployeesByDepartment(Long deptId) {
        List<Employee> employees;
        if (deptId != null) {
            employees = employeeRepository.findByDepartmentIdWithDeptAndUser(deptId);
        } else {
            employees = employeeRepository.findAllWithDeptAndUser();
        }
        return employees.stream()
                .map(EmployeeDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 직원 상세 정보 조회
     */
    public EmployeeDetailDto getEmployeeDetail(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND, "해당 직원을 찾을 수 없습니다."));
        return EmployeeDetailDto.from(employee);
    }

    /**
     * 직원 검색 (이름 또는 이메일)
     */
    public List<EmployeeSearchDto> searchEmployees(String keyword) {
        List<Employee> employees = employeeRepository.searchByNameOrEmail(keyword);
        return employees.stream()
                .map(EmployeeSearchDto::from)
                .collect(Collectors.toList());
    }
}
