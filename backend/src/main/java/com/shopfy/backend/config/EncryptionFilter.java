package com.shopfy.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shopfy.backend.util.EncryptionUtil;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
public class EncryptionFilter implements Filter {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Check if request has encrypted data
        String encryptedHeader = httpRequest.getHeader("X-Encrypted");

        if ("true".equals(encryptedHeader)) {
            // Wrap request and response for encryption/decryption
            EncryptedRequestWrapper requestWrapper = new EncryptedRequestWrapper(httpRequest);
            EncryptedResponseWrapper responseWrapper = new EncryptedResponseWrapper(httpResponse);

            // Add encryption header to response
            httpResponse.setHeader("X-Encrypted", "true");

            chain.doFilter(requestWrapper, responseWrapper);

            // Encrypt response data
            String responseData = responseWrapper.getCapturedData();
            if (responseData != null && !responseData.isEmpty()) {
                String encryptedResponse = EncryptionUtil.encrypt(responseData);
                Map<String, String> encryptedMap = Map.of("encrypted", encryptedResponse);
                String jsonResponse = objectMapper.writeValueAsString(encryptedMap);

                httpResponse.setContentType("application/json");
                httpResponse.getWriter().write(jsonResponse);
            }
        } else {
            // No encryption, proceed normally
            chain.doFilter(request, response);
        }
    }
}
