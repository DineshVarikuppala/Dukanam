package com.shopfy.backend.controller;

import com.shopfy.backend.entity.Order;
import com.shopfy.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/place")
    public ResponseEntity<String> placeOrder(
            @RequestParam Long userId,
            @RequestParam Long storeId,
            @RequestParam String address,
            @RequestParam String paymentMethod) {

        Long orderId = orderService.placeOrder(userId, storeId, address, paymentMethod);
        return ResponseEntity.ok("Order placed successfully. Order ID: " + orderId);
    }

    @GetMapping("/customer")
    public ResponseEntity<List<Order>> getCustomerOrders(@RequestParam Long userId) {
        return ResponseEntity.ok(orderService.getCustomerOrders(userId));
    }

    @GetMapping("/store")
    public ResponseEntity<List<Order>> getStoreOrders(@RequestParam Long storeId) {
        return ResponseEntity.ok(orderService.getStoreOrders(storeId));
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<String> updateStatus(@PathVariable Long orderId, @RequestBody Map<String, String> payload) {
        orderService.updateStatus(orderId, payload.get("status"));
        return ResponseEntity.ok("Order status updated");
    }
}
