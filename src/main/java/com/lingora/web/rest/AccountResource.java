package com.lingora.web.rest;

import com.lingora.domain.User;
import com.lingora.repository.UserRepository;
import com.lingora.security.SecurityUtils;
import com.lingora.service.MailService;
import com.lingora.service.UserService;
import com.lingora.service.dto.AdminUserDTO;
import com.lingora.service.dto.PasswordChangeDTO;
import com.lingora.service.learning.ProfileService;
import com.lingora.web.rest.errors.*;
import com.lingora.web.rest.vm.KeyAndPasswordVM;
import com.lingora.web.rest.vm.ManagedUserVM;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import java.util.*;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing the current user's account.
 */
@RestController
@RequestMapping("/api")
@Validated
public class AccountResource {

    @ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "Account resource request invalid")
    private static class AccountResourceException extends RuntimeException {

        private AccountResourceException(String message) {
            super(message);
        }
    }

    private static final Logger LOG = LoggerFactory.getLogger(AccountResource.class);

    private final UserRepository userRepository;

    private final UserService userService;

    private final MailService mailService;

    private final PasswordEncoder passwordEncoder;

    private final ProfileService profileService;

    public AccountResource(
        UserRepository userRepository,
        UserService userService,
        MailService mailService,
        PasswordEncoder passwordEncoder,
        ProfileService profileService
    ) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.mailService = mailService;
        this.passwordEncoder = passwordEncoder;
        this.profileService = profileService;
    }

    /**
     * {@code POST  /register} : register the user.
     *
     * @param managedUserVM the managed user View Model.
     * @throws InvalidPasswordException {@code 400 (Bad Request)} if the password is incorrect.
     * @throws EmailAlreadyUsedException {@code 400 (Bad Request)} if the email is already used.
     * @throws LoginAlreadyUsedException {@code 400 (Bad Request)} if the login is already used.
     */
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void registerAccount(@Valid @RequestBody ManagedUserVM managedUserVM) {
        LOG.debug("REST request to register account");
        if (isPasswordLengthInvalid(managedUserVM.getPassword())) {
            throw new InvalidPasswordException();
        }
        User user = userService.registerUser(managedUserVM, managedUserVM.getPassword());
        profileService.create(user, managedUserVM.getFirstName(), true, false);
        if (!user.isActivated()) mailService.sendActivationEmail(user);
    }

    /**
     * {@code POST /account/resend-activation} : send the activation email again (always answers 200 so
     * that the endpoint cannot be used to discover registered emails).
     */
    @PostMapping("/account/resend-activation")
    public void resendActivation(@RequestBody @Email @Size(min = 5, max = 254) String mail) {
        userService.prepareActivationResend(mail.trim()).ifPresent(mailService::sendActivationEmail);
    }

    /**
     * {@code GET  /activate} : activate the registered user.
     *
     * @param key the activation key.
     * @throws RuntimeException {@code 500 (Internal Server Error)} if the user couldn't be activated.
     */
    @GetMapping("/activate")
    public void activateAccount(@RequestParam(value = "key") String key) {
        LOG.debug("REST request to activate account");
        Optional<User> user = userService.activateRegistration(key);
        if (user.isEmpty()) {
            throw new AccountResourceException("No user was found for this activation key");
        }
    }

    /**
     * {@code GET  /account} : get the current user.
     *
     * @return the current user.
     * @throws RuntimeException {@code 500 (Internal Server Error)} if the user couldn't be returned.
     */
    @GetMapping("/account")
    public AdminUserDTO getAccount() {
        LOG.debug("REST request to get account");
        return userService
            .getUserWithAuthorities()
            .map(AdminUserDTO::new)
            .orElseThrow(() -> new AccountResourceException("User could not be found"));
    }

    /**
     * {@code POST  /account} : update the current user information.
     *
     * @param userDTO the current user information.
     * @throws EmailAlreadyUsedException {@code 400 (Bad Request)} if the email is already used.
     * @throws RuntimeException {@code 500 (Internal Server Error)} if the user login wasn't found.
     */
    @PostMapping("/account")
    public void saveAccount(@Valid @RequestBody AdminUserDTO userDTO) {
        LOG.debug("REST request to save account");
        String userLogin = SecurityUtils.getCurrentUserLogin().orElseThrow(() ->
            new AccountResourceException("Current user login not found")
        );
        Optional<User> existingUser = userRepository.findOneByEmailIgnoreCase(userDTO.getEmail());
        if (existingUser.isPresent() && !existingUser.orElseThrow().getLogin().equalsIgnoreCase(userLogin)) {
            throw new EmailAlreadyUsedException();
        }
        Optional<User> user = userRepository.findOneByLogin(userLogin);
        if (user.isEmpty()) {
            throw new AccountResourceException("User could not be found");
        }
        // The email is the sign-in name and is never changed here: an unverified address would take over the account.
        userService.updateUser(userDTO.getFirstName(), userDTO.getLastName(), null, userDTO.getLangKey(), userDTO.getImageUrl());
    }

    /**
     * {@code POST  /account/change-password} : changes the current user's password.
     *
     * @param passwordChangeDto current and new password.
     * @throws InvalidPasswordException {@code 400 (Bad Request)} if the new password is incorrect.
     */
    @PostMapping(path = "/account/change-password")
    public void changePassword(@RequestBody PasswordChangeDTO passwordChangeDto) {
        LOG.debug("REST request to change password");
        if (isPasswordLengthInvalid(passwordChangeDto.getNewPassword())) {
            throw new InvalidPasswordException();
        }
        userService.changePassword(passwordChangeDto.getCurrentPassword(), passwordChangeDto.getNewPassword());
    }

    /**
     * {@code POST   /account/reset-password/init} : Send an email to reset the password of the user.
     *
     * @param mail the mail of the user.
     */
    @PostMapping(path = "/account/reset-password/init")
    public void requestPasswordReset(@RequestBody @Email @Size(min = 5, max = 254) String mail) {
        LOG.debug("REST request to request password reset");
        Optional<User> user = userService.requestPasswordReset(mail);
        if (user.isPresent()) {
            mailService.sendPasswordResetMail(user.orElseThrow());
        } else {
            // Pretend the request has been successful to prevent checking which emails really exist
            // but log that an invalid attempt has been made
            LOG.warn("Password reset requested for non existing mail");
        }
    }

    /**
     * {@code POST   /account/reset-password/finish} : Finish to reset the password of the user.
     *
     * @param keyAndPassword the generated key and the new password.
     * @throws InvalidPasswordException {@code 400 (Bad Request)} if the password is incorrect.
     * @throws RuntimeException {@code 500 (Internal Server Error)} if the password could not be reset.
     */
    @PostMapping(path = "/account/reset-password/finish")
    public void finishPasswordReset(@RequestBody KeyAndPasswordVM keyAndPassword) {
        if (isPasswordLengthInvalid(keyAndPassword.getNewPassword())) {
            throw new InvalidPasswordException();
        }
        Optional<User> user = userService.completePasswordReset(keyAndPassword.getNewPassword(), keyAndPassword.getKey());

        if (user.isEmpty()) {
            // Dummy hash to prevent reset-key enumeration via response-time timing attack:
            // mirrors the bcrypt cost of a successful path so both branches take equal time.
            passwordEncoder.encode(keyAndPassword.getNewPassword());
            throw new AccountResourceException("No user was found for this reset key");
        }
        profileService.markPasswordSet(user.orElseThrow().getId());
    }

    /** At least 8 characters with a letter and a digit (same rule as the Angular forms). */
    private static boolean isPasswordLengthInvalid(String password) {
        return (
            StringUtils.isEmpty(password) ||
            password.length() < 8 ||
            password.length() > ManagedUserVM.PASSWORD_MAX_LENGTH ||
            password.chars().noneMatch(Character::isLetter) ||
            password.chars().noneMatch(Character::isDigit)
        );
    }
}
