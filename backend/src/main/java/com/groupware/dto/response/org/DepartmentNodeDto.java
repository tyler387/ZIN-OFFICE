package com.groupware.dto.response.org;

import com.groupware.domain.Department;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class DepartmentNodeDto {
    private Long id;
    private String name;
    private Long parentId;
    private int displayOrder;
    private List<DepartmentNodeDto> children;

    public static DepartmentNodeDto from(Department department) {
        return DepartmentNodeDto.builder()
                .id(department.getId())
                .name(department.getName())
                .parentId(department.getParentDept() != null ? department.getParentDept().getId() : null)
                .displayOrder(department.getDisplayOrder())
                .children(department.getChildren().stream()
                        .map(DepartmentNodeDto::from)
                        .collect(Collectors.toList()))
                .build();
    }
}
