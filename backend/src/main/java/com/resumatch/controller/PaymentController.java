package com.resumatch.controller;

import com.razorpay.Order;
import com.resumatch.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data) {
        try {
            if (data == null || !data.containsKey("planId") || !data.containsKey("amount")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Missing planId or amount"));
            }

            String planId = data.get("planId").toString();
            int amountInRupees = Integer.parseInt(data.get("amount").toString());
            
            log.info("Payment Request: plan={}, amount={}", planId, amountInRupees);
            
            Order order = paymentService.createOrder(planId, amountInRupees);

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.get("id"));
            response.put("amount", order.get("amount")); 
            response.put("currency", order.get("currency"));

            log.info("Razorpay Order Created: {}", (Object) order.get("id"));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Order creation failed", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "ORDER_CREATION_FAILED",
                "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature) {
        try {
            paymentService.handleWebhook(payload, signature);
            return ResponseEntity.ok("Webhook processed");
        } catch (Exception e) {
            log.error("Webhook processing failed", e);
            return ResponseEntity.badRequest().body("Webhook processing failed: " + e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> request) {
        try {
            String paymentId = request.get("paymentId");
            String orderId = request.get("orderId");
            String signature = request.get("signature");
            String email = request.get("email");

            log.info("Verifying payment: paymentId={}, orderId={}, email={}", paymentId, orderId, email);

            paymentService.verifyPayment(paymentId, orderId, signature, email);
            return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Payment verified and tier updated"));
        } catch (Exception e) {
            log.error("Payment verification failed", e);
            return ResponseEntity.status(400).body(Map.of("status", "ERROR", "message", e.getMessage()));
        }
    }
}
