package ug.tutorug.api.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ug.tutorug.api.dto.request.UpdateProfileRequest;
import ug.tutorug.api.dto.response.UserResponse;
import ug.tutorug.api.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserResponse me() {
        return userService.getMe();
    }

    @PatchMapping("/me")
    public UserResponse updateMe(@RequestBody UpdateProfileRequest request) {
        return userService.updateMe(request);
    }

    @PutMapping("/me")
    public UserResponse replaceMe(@RequestBody UpdateProfileRequest request) {
        return userService.updateMe(request);
    }
}
