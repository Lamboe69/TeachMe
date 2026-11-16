package ug.tutorug.api.web;

import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ug.tutorug.api.dto.request.ForgotPasswordRequest;
import ug.tutorug.api.dto.request.LoginRequest;
import ug.tutorug.api.dto.request.RegisterRequest;
import ug.tutorug.api.dto.response.AuthResponse;
import ug.tutorug.api.dto.response.UserResponse;
import ug.tutorug.api.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        authService.logout();
        return ResponseEntity.ok(Map.of("message", "Signed out."));
    }

    @GetMapping("/me")
    public UserResponse me() {
        return authService.me();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        authService.requestPasswordReset(request.email());
        return ResponseEntity.accepted().body(Map.of(
                "message", "If an account exists for that email, we'll send reset instructions."));
    }
}
