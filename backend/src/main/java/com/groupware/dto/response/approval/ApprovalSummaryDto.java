package com.groupware.dto.response.approval;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ApprovalSummaryDto {
    private long pendingCount;
    private long draftCount;
    private long refWaitCount;
}
