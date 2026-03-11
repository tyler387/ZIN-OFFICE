package com.groupware.global.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

public final class KoreaTime {

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");

    private KoreaTime() {
    }

    public static LocalDate nowDate() {
        return LocalDate.now(KST);
    }

    public static LocalDateTime nowDateTime() {
        return LocalDateTime.now(KST);
    }
}
