package com.lingora.repository;

import com.lingora.domain.AccountLock;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountLockRepository extends JpaRepository<AccountLock, Long> {}
