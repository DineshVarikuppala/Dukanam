package com.shopfy.backend.service;

import com.shopfy.backend.entity.*;
import com.shopfy.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public Long placeOrder(Long userId, Long storeId, String address, String paymentMethod) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found"));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart is empty"));

        // Filter items for this store
        List<CartItem> storeItems = cart.getItems().stream()
                .filter(item -> item.getProduct().getStore().getStoreId().equals(storeId))
                .collect(Collectors.toList());

        if (storeItems.isEmpty()) {
            throw new RuntimeException("No items in cart for this store");
        }

        Order order = new Order();
        order.setCustomer(user);
        order.setStore(store);
        order.setDeliveryAddress(address);
        order.setPaymentMethod(paymentMethod); // Set Payment Method

        BigDecimal total = BigDecimal.ZERO;

        for (CartItem item : storeItems) {
            BigDecimal lineTotal = item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            total = total.add(lineTotal);
        }
        order.setTotalAmount(total);

        Order savedOrder = orderRepository.save(order);

        // Convert CartItems to OrderItems and remove from cart
        for (CartItem ci : storeItems) {
            OrderItem oi = new OrderItem();
            oi.setOrder(savedOrder);
            oi.setProduct(ci.getProduct());
            oi.setQuantity(ci.getQuantity());
            oi.setPriceAtOrder(ci.getProduct().getPrice());
            orderItemRepository.save(oi);

            // Remove from cart's collection first (important for orphanRemoval)
            cart.getItems().remove(ci);
            // Then delete from repository
            cartItemRepository.delete(ci);
        }

        // Save cart to persist the removal
        cartRepository.save(cart);

        // Send Notification
        notificationService.sendOrderConfirmation(user, savedOrder);

        return savedOrder.getOrderId();
    }

    public List<Order> getCustomerOrders(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepository.findByCustomer(user);
    }

    public List<Order> getStoreOrders(Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found"));
        return orderRepository.findByStore(store);
    }

    public void updateStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        try {
            order.setStatus(Order.OrderStatus.valueOf(status));
            order.setUpdatedAt(java.time.LocalDateTime.now());
            Order savedOrder = orderRepository.save(order);

            // Send Notification
            notificationService.sendOrderStatusUpdate(order.getCustomer(), savedOrder);

        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status");
        }
    }
}
