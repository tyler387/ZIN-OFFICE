package com.groupware.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Serves the Vite SPA entrypoint for client-side routes.
 */
@Controller
public class SpaController {

    @GetMapping({
            "/",
            "/login",
            "/home",
            "/approval",
            "/approval/**",
            "/board",
            "/board/**",
            "/drive",
            "/drive/**",
            "/alldocs",
            "/docmgr",
            "/docmgr/**",
            "/mail",
            "/mail/**",
            "/report",
            "/report/**",
            "/attendance",
            "/attendance/**",
            "/messenger",
            "/calendar",
            "/reserve",
            "/reserve/**",
            "/community",
            "/community/**"
    })
    public String index() {
        return "forward:/index.html";
    }
}
