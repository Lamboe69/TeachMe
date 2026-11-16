package ug.tutorug.api.web;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ug.tutorug.api.dto.request.MobileMoneyRequest;
import ug.tutorug.api.dto.response.TransactionResponse;
import ug.tutorug.api.dto.response.WalletResponse;
import ug.tutorug.api.service.WalletService;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping
    public WalletResponse wallet() {
        return walletService.getWallet();
    }

    @GetMapping("/transactions")
    public List<TransactionResponse> transactions() {
        return walletService.listTransactions();
    }

    @PostMapping("/top-up")
    public WalletResponse topUp(@Valid @RequestBody MobileMoneyRequest request) {
        return walletService.topUp(request);
    }

    @PostMapping("/withdraw")
    public WalletResponse withdraw(@Valid @RequestBody MobileMoneyRequest request) {
        return walletService.withdraw(request);
    }
}
