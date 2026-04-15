package com.resumatch.config;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RazorpayConfig {

    @org.springframework.beans.factory.annotation.Value("${razorpay.keyId}")
    private String keyId;

    @org.springframework.beans.factory.annotation.Value("${razorpay.keySecret}")
    private String keySecret;

    @Bean
    public RazorpayClient razorpayClient() throws RazorpayException {
        return new RazorpayClient(keyId, keySecret);
    }
}
