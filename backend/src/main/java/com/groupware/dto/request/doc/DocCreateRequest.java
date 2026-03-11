package com.groupware.dto.request.doc;

import lombok.Getter;

@Getter
public class DocCreateRequest {
    private String title;
    private String content;
    private String formType;
}
