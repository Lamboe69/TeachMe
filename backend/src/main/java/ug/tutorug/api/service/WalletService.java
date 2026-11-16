package ug.tutorug.api.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.tutorug.api.config.AppProperties;
import ug.tutorug.api.domain.Escrow;
import ug.tutorug.api.domain.EscrowStatus;
import ug.tutorug.api.domain.MobileNetwork;
import ug.tutorug.api.domain.TutoringSession;
import ug.tutorug.api.domain.User;
import ug.tutorug.api.domain.Wallet;
import ug.tutorug.api.domain.WalletTransaction;
import ug.tutorug.api.domain.WalletTransactionType;
import ug.tutorug.api.dto.request.MobileMoneyRequest;
import ug.tutorug.api.dto.response.TransactionResponse;
import ug.tutorug.api.dto.response.WalletResponse;
import ug.tutorug.api.error.ApiException;
import ug.tutorug.api.repository.EscrowRepository;
import ug.tutorug.api.repository.UserRepository;
import ug.tutorug.api.repository.WalletRepository;
import ug.tutorug.api.repository.WalletTransactionRepository;
import ug.tutorug.api.security.CurrentUser;

/**
 * Wallet balances, mobile money transfers, and the escrow lifecycle that moves
 * a session fee between the student, TutorUG and the tutor.
 */
@Service
public class WalletService {

    private static final long MIN_AMOUNT = 1_000L;
    private static final long MAX_AMOUNT = 5_000_000L;

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;
    private final EscrowRepository escrowRepository;
    private final CurrentUser currentUser;
    private final AppProperties properties;

    public WalletService(
            UserRepository userRepository,
            WalletRepository walletRepository,
            WalletTransactionRepository transactionRepository,
            EscrowRepository escrowRepository,
            CurrentUser currentUser,
            AppProperties properties) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.escrowRepository = escrowRepository;
        this.currentUser = currentUser;
        this.properties = properties;
    }

    @Transactional
    public Wallet getOrCreate(String userId) {
        return walletRepository.findById(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> ApiException.unauthorized(
                            "Your session has expired. Please sign in again."));
            Wallet wallet = new Wallet();
            wallet.setUser(user);
            wallet.setAvailableBalance(0);
            wallet.setEscrowBalance(0);
            wallet.setCurrency("UGX");
            wallet.setUpdatedAt(Instant.now());
            return walletRepository.save(wallet);
        });
    }

    @Transactional(readOnly = true)
    public WalletResponse getWallet() {
        User user = currentUser.requireUser();
        return WalletResponse.from(getOrCreate(user.getId()));
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> listTransactions() {
        User user = currentUser.requireUser();
        return transactionRepository.findByUser_IdOrderByCreatedAtDesc(user.getId()).stream()
                .map(TransactionResponse::from)
                .toList();
    }

    @Transactional
    public WalletResponse topUp(MobileMoneyRequest request) {
        User user = currentUser.requireUser();
        long amount = validateAmount(request.amount());
        String phone = validatePhone(request.phone());
        MobileNetwork network = normalizeNetwork(request.network());

        Wallet wallet = getOrCreate(user.getId());
        wallet.setAvailableBalance(wallet.getAvailableBalance() + amount);
        wallet.setUpdatedAt(Instant.now());
        walletRepository.save(wallet);

        record(user, WalletTransactionType.TOP_UP, amount, wallet.getAvailableBalance(),
                "Top-up via " + label(network) + " · " + phone, null);
        return WalletResponse.from(wallet);
    }

    @Transactional
    public WalletResponse withdraw(MobileMoneyRequest request) {
        User user = currentUser.requireUser();
        long amount = validateAmount(request.amount());
        String phone = validatePhone(request.phone());
        MobileNetwork network = normalizeNetwork(request.network());

        Wallet wallet = getOrCreate(user.getId());
        if (amount > wallet.getAvailableBalance()) {
            throw new ApiException(400, "You cannot withdraw more than your available balance.",
                    java.util.Map.of("amount", "Amount exceeds your available balance."));
        }

        wallet.setAvailableBalance(wallet.getAvailableBalance() - amount);
        wallet.setUpdatedAt(Instant.now());
        walletRepository.save(wallet);

        record(user, WalletTransactionType.WITHDRAWAL, -amount, wallet.getAvailableBalance(),
                "Withdrawal to " + label(network) + " · " + phone, null);
        return WalletResponse.from(wallet);
    }

    /** Moves a session fee from the student's available balance into escrow. */
    @Transactional
    public void holdSessionFunds(TutoringSession session) {
        long amount = session.getFee() == null ? 0L : session.getFee();
        if (amount <= 0) return;

        Escrow existing = escrowRepository.findById(session.getId()).orElse(null);
        if (existing != null && existing.getStatus() != EscrowStatus.REFUNDED) return;

        Wallet studentWallet = getOrCreate(session.getStudent().getId());
        if (studentWallet.getAvailableBalance() < amount) {
            throw new ApiException(400,
                    "Your wallet balance is too low for this session. Top up your wallet and try again.",
                    java.util.Map.of("wallet", "Top up your wallet to book this session."));
        }

        long tutorNet = netOf(amount);
        Wallet tutorWallet = getOrCreate(session.getTutor().getId());

        studentWallet.setAvailableBalance(studentWallet.getAvailableBalance() - amount);
        studentWallet.setEscrowBalance(studentWallet.getEscrowBalance() + amount);
        studentWallet.setUpdatedAt(Instant.now());
        walletRepository.save(studentWallet);

        tutorWallet.setEscrowBalance(tutorWallet.getEscrowBalance() + tutorNet);
        tutorWallet.setUpdatedAt(Instant.now());
        walletRepository.save(tutorWallet);

        Escrow escrow = existing != null ? existing : new Escrow();
        escrow.setSessionId(session.getId());
        escrow.setStudentId(session.getStudent().getId());
        escrow.setTutorId(session.getTutor().getId());
        escrow.setAmount(amount);
        escrow.setStatus(EscrowStatus.HELD);
        escrow.setCreatedAt(Instant.now());
        escrowRepository.save(escrow);

        record(session.getStudent(), WalletTransactionType.SESSION_PAYMENT, -amount,
                studentWallet.getAvailableBalance(),
                "Session with " + session.getTutor().getFullName() + " held in escrow",
                session.getId());
    }

    /** Releases held funds to the tutor, minus the platform fee. */
    @Transactional
    public void releaseSessionEarnings(TutoringSession session) {
        Escrow escrow = escrowRepository.findById(session.getId()).orElse(null);
        if (escrow == null || escrow.getStatus() != EscrowStatus.HELD) return;

        long tutorNet = netOf(escrow.getAmount());

        Wallet studentWallet = getOrCreate(escrow.getStudentId());
        studentWallet.setEscrowBalance(Math.max(0, studentWallet.getEscrowBalance() - escrow.getAmount()));
        studentWallet.setUpdatedAt(Instant.now());
        walletRepository.save(studentWallet);

        Wallet tutorWallet = getOrCreate(escrow.getTutorId());
        tutorWallet.setEscrowBalance(Math.max(0, tutorWallet.getEscrowBalance() - tutorNet));
        tutorWallet.setAvailableBalance(tutorWallet.getAvailableBalance() + tutorNet);
        tutorWallet.setUpdatedAt(Instant.now());
        walletRepository.save(tutorWallet);

        escrow.setStatus(EscrowStatus.RELEASED);
        escrowRepository.save(escrow);

        User tutor = userRepository.findById(escrow.getTutorId()).orElseThrow();
        record(tutor, WalletTransactionType.SESSION_EARNING, tutorNet,
                tutorWallet.getAvailableBalance(),
                session.getSubject() + " session earnings after " + properties.getPlatformFeePercent()
                        + "% TutorUG fee",
                session.getId());
    }

    /** Returns held funds to the student when a request is declined or cancelled. */
    @Transactional
    public void refundSessionFunds(TutoringSession session) {
        Escrow escrow = escrowRepository.findById(session.getId()).orElse(null);
        if (escrow == null || escrow.getStatus() != EscrowStatus.HELD) return;

        long tutorNet = netOf(escrow.getAmount());

        Wallet studentWallet = getOrCreate(escrow.getStudentId());
        studentWallet.setEscrowBalance(Math.max(0, studentWallet.getEscrowBalance() - escrow.getAmount()));
        studentWallet.setAvailableBalance(studentWallet.getAvailableBalance() + escrow.getAmount());
        studentWallet.setUpdatedAt(Instant.now());
        walletRepository.save(studentWallet);

        Wallet tutorWallet = getOrCreate(escrow.getTutorId());
        tutorWallet.setEscrowBalance(Math.max(0, tutorWallet.getEscrowBalance() - tutorNet));
        tutorWallet.setUpdatedAt(Instant.now());
        walletRepository.save(tutorWallet);

        escrow.setStatus(EscrowStatus.REFUNDED);
        escrowRepository.save(escrow);

        User student = userRepository.findById(escrow.getStudentId()).orElseThrow();
        record(student, WalletTransactionType.REFUND, escrow.getAmount(),
                studentWallet.getAvailableBalance(),
                "Refund for " + session.getSubject() + " session · " + session.getTutor().getFullName(),
                session.getId());
    }

    private long netOf(long amount) {
        long fee = Math.round((amount * properties.getPlatformFeePercent()) / 100.0);
        return Math.max(0, amount - fee);
    }

    private WalletTransaction record(
            User user,
            WalletTransactionType type,
            long amount,
            long balanceAfter,
            String description,
            String sessionId) {
        WalletTransaction transaction = new WalletTransaction();
        transaction.setUser(user);
        transaction.setType(type);
        transaction.setAmount(amount);
        transaction.setBalanceAfter(balanceAfter);
        transaction.setSessionId(sessionId);
        transaction.setDescription(description);
        transaction.setReference("REF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        transaction.setCreatedAt(Instant.now());
        return transactionRepository.save(transaction);
    }

    private long validateAmount(Double rawAmount) {
        long rounded = Math.round(rawAmount == null ? 0 : rawAmount);
        if (rounded < MIN_AMOUNT) {
            throw new ApiException(400, "Enter an amount of at least UGX 1,000.",
                    java.util.Map.of("amount", "Enter an amount of at least UGX 1,000."));
        }
        if (rounded > MAX_AMOUNT) {
            throw new ApiException(400,
                    "Mobile money transfers are limited to UGX 5,000,000 at a time.",
                    java.util.Map.of("amount", "Maximum UGX 5,000,000 per transfer."));
        }
        return rounded;
    }

    private String validatePhone(String phone) {
        String cleaned = phone == null ? "" : phone.replaceAll("[\\s-]", "");
        if (!cleaned.matches("^\\+?[0-9]{9,15}$")) {
            throw new ApiException(400,
                    "Enter a valid mobile money number, e.g. +256 772 445 019.",
                    java.util.Map.of("phone", "Enter a valid mobile money number."));
        }
        return cleaned;
    }

    private MobileNetwork normalizeNetwork(MobileNetwork network) {
        return network == MobileNetwork.AIRTEL ? MobileNetwork.AIRTEL : MobileNetwork.MTN;
    }

    private String label(MobileNetwork network) {
        return network == MobileNetwork.AIRTEL ? "Airtel Money" : "MTN MoMo";
    }
}
