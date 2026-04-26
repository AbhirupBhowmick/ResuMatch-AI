package com.resumatch.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.resumatch.model.User;
import com.resumatch.model.SubscriptionTier;
import com.resumatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final RazorpayClient razorpayClient;
    private final UserRepository userRepository;

    @org.springframework.beans.factory.annotation.Value("${razorpay.keySecret}")
    private String keySecret;

    @org.springframework.beans.factory.annotation.Value("${razorpay.webhookSecret}")
    private String webhookSecret;

    public Order createOrder(String planId, int amountInInr) throws RazorpayException {
        JSONObject orderRequest = new JSONObject();
        
        // Use Long for amount and multiply by 100 (rupees to paise)
        long amountInPaise = (long) amountInInr * 100;
        
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "receipt_" + System.currentTimeMillis());
        
        // payment_capture deprecated in modern SDK and dashboard options
        
        JSONObject notes = new JSONObject();
        notes.put("planId", planId);
        // Also adding to notes as requested
        notes.put("payment_capture", "1");
        orderRequest.put("notes", notes);

        log.info("Creating Razorpay Order for Plan: {}, Amount: {} paise", planId, amountInPaise);
        return razorpayClient.orders.create(orderRequest);
    }

    @Transactional
    public void verifyPayment(String paymentId, String orderId, String signature, String email) throws Exception {
        log.info("Verifying Payment: id={}, orderId={}, user={}", paymentId, orderId, email);
        
        JSONObject params = new JSONObject();
        params.put("razorpay_order_id", orderId);
        params.put("razorpay_payment_id", paymentId);
        params.put("razorpay_signature", signature);

        boolean isValid = Utils.verifyPaymentSignature(params, keySecret);

        if (!isValid) {
            log.error("Signature Verification Failed!");
            throw new Exception("Invalid Payment Signature");
        }

        Order order = razorpayClient.orders.fetch(orderId);
        String planId = "STARTER";
        
        Object notesObj = order.get("notes");
        if (notesObj instanceof Map) {
            Map<?, ?> notes = (Map<?, ?>) notesObj;
            if (notes.get("planId") != null) planId = notes.get("planId").toString();
        } else if (notesObj instanceof JSONObject) {
            JSONObject notes = (JSONObject) notesObj;
            if (notes.has("planId")) planId = notes.getString("planId");
        }

        updateUserPremiumStatus(email, planId);
    }

    @Transactional
    public void handleWebhook(String payload, String signature) throws Exception {
        boolean isValid = Utils.verifyWebhookSignature(payload, signature, webhookSecret);
        if (!isValid) throw new Exception("Invalid Webhook Signature");

        JSONObject jsonPayload = new JSONObject(payload);
        String event = jsonPayload.getString("event");

        if ("payment.captured".equals(event)) {
            JSONObject payment = jsonPayload.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
            String email = payment.getString("email");
            String orderId = payment.getString("order_id");
            
            Order order = razorpayClient.orders.fetch(orderId);
            Object notesObj = order.get("notes");
            String planId = "STARTER";
            if (notesObj instanceof Map) {
                Map<?, ?> notes = (Map<?, ?>) notesObj;
                if (notes.get("planId") != null) planId = notes.get("planId").toString();
            }
            updateUserPremiumStatus(email, planId);
        }
    }

    private void updateUserPremiumStatus(String email, String plan) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setPremium(true);
            user.setPremiumPlan(plan);
            user.setPremiumExpiryDate(LocalDate.now().plusDays(30));
            
            String normalizedPlan = plan.toUpperCase().replace(" ", "_");
            if (normalizedPlan.contains("STARTER")) {
                user.setSubscriptionTier(SubscriptionTier.STARTER);
            } else if (normalizedPlan.contains("ACTIVE") || normalizedPlan.contains("HUNTER")) {
                user.setSubscriptionTier(SubscriptionTier.ACTIVE_HUNTER);
            } else if (normalizedPlan.contains("PRO") || normalizedPlan.contains("ACHIEVER")) {
                user.setSubscriptionTier(SubscriptionTier.PRO_ACHIEVER);
            } else {
                user.setSubscriptionTier(SubscriptionTier.STARTER);
            }

            userRepository.save(user);
            log.info("Subscription Activated for User: {}, Tier: {}", email, user.getSubscriptionTier());
        });
    }
}
