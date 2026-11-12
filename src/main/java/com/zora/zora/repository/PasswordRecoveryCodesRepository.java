package com.zora.zora.repository;

import com.zora.zora.model.PasswordRecoveryCodes;
import org.springframework.data.repository.CrudRepository;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

public interface PasswordRecoveryCodesRepository extends CrudRepository<PasswordRecoveryCodes, UUID> {

    Optional<PasswordRecoveryCodes> findFirstByUserIdAndUsedAtIsNullAndExpiresAtAfterOrderByIssuedAtDesc(UUID userId, OffsetDateTime now);
    Optional<PasswordRecoveryCodes> findFirstByUserIdAndUsedAtIsNullAndVerifiedAtIsNullAndExpiresAtAfterOrderByIssuedAtDesc(UUID userId, OffsetDateTime now);
    Boolean existsByUserIdAndIssuedAtAfter(UUID userId, OffsetDateTime since);

}
