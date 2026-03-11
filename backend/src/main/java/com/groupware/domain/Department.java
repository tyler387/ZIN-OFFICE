package com.groupware.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "department")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Department parentDept;

    @OneToMany(mappedBy = "parentDept", cascade = CascadeType.ALL)
    private List<Department> children = new ArrayList<>();

    @Column(nullable = false)
    private int displayOrder;

    @Builder
    public Department(String name, Department parentDept, int displayOrder) {
        this.name = name;
        this.parentDept = parentDept;
        this.displayOrder = displayOrder;
    }
}
