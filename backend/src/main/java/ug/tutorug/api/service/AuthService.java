package ug.tutorug.api.service;

import java.util.Map;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.tutorug.api.domain.TutorProfile;
import ug.tutorug.api.domain.User;
import ug.tutorug.api.domain.UserRole;
import ug.tutorug.api.dto.request.LoginRequest;
import ug.tutorug.api.dto.request.RegisterRequest;
import ug.tutorug.api.dto.response.AuthResponse;
import ug.tutorug.api.dto.response.UserResponse;
import ug.tutorug.api.error.ApiException;
import ug.tutorug.api.repository.TutorProfileRepository;
import ug.tutorug.api.repository.UserRepository;
import ug.tutorug.api.security.CurrentUser;
import ug.tutorug.api.security.JwtService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final WalletService walletService;
    private final CurrentUser currentUser;

    public AuthService(
            UserRepository userRepository,
            TutorProfileRepository tutorProfileRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            WalletService walletService,
            CurrentUser currentUser) {
        this.userRepository = userRepository;
        this.tutorProfileRepository = tutorProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.walletService = walletService;
        this.currentUser = currentUser;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ApiException(409,
                    "An account with that email already exists. Try logging in instead.",
                    Map.of("email", "An account with that email already exists."));
        }

        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        userRepository.save(user);

        if (user.getRole() == UserRole.TUTOR) {
            TutorProfile profile = new TutorProfile();
            profile.setUser(user);
            profile.setHourlyRate(0);
            tutorProfileRepository.save(profile);
            user.setTutorProfile(profile);
        }

        walletService.getOrCreate(user.getId());
        return toAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new ApiException(401,
                        "That email and password combination does not match our records.",
                        Map.of("password",
                                "That email and password combination does not match our records.")));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(401,
                    "That email and password combination does not match our records.",
                    Map.of("password",
                            "That email and password combination does not match our records."));
        }

        return toAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse me() {
        return UserResponse.from(currentUser.requireUser());
    }

    /** Stateless bearer auth: there is no server-side session to end. */
    public void logout() {
        // No-op.
    }

    /**
     * Password reset is not part of the MVP contract. We accept the request and
     * answer neutrally rather than pretending an email was sent.
     */
    public void requestPasswordReset(String email) {
        // No-op: the frontend only calls this when the feature is enabled.
    }

    private AuthResponse toAuthResponse(User user) {
        String token = jwtService.generateToken(user);
        return new AuthResponse(token, "Bearer", user.getId(), user.getRole(),
                UserResponse.from(user));
    }
}
