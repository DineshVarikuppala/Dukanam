package com.shopfy.backend.service;

import com.shopfy.backend.entity.Notification;
import com.shopfy.backend.entity.Order;
import com.shopfy.backend.entity.User;
import com.shopfy.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private OtpService otpService;

    private static final String RESET = "\u001B[0m";
    private static final String BLUE = "\u001B[34m";
    private static final String GREEN = "\u001B[32m";

    public void sendOrderConfirmation(User user, Order order) {
        // Save to DB
        Notification notification = new Notification();
        notification.setRecipient(user);
        notification
                .setMessage("Order #" + order.getOrderId() + " placed successfully! Total: ₹" + order.getTotalAmount());
        notification.setRelatedOrderId(order.getOrderId());
        notificationRepository.save(notification);

        // Notify Store Owner too
        Notification storeNotif = new Notification();
        storeNotif.setRecipient(order.getStore().getOwner());

        String productNames = order.getItems().stream()
                .map(item -> item.getProduct().getProductName())
                .reduce((a, b) -> a + ", " + b)
                .orElse("Items");

        storeNotif.setMessage("New Order Alert! " + productNames + ", please accept");
        storeNotif.setRelatedOrderId(order.getOrderId());
        notificationRepository.save(storeNotif);

        // Send emails if enabled
        if (user.getEmailNotificationsEnabled() != null && user.getEmailNotificationsEnabled()) {
            try {
                otpService.sendEmail(user.getEmail(), "Order Confirmation - DUKANAM",
                        "Your order #" + order.getOrderId() + " has been placed successfully!\n\nTotal Amount: ₹"
                                + order.getTotalAmount() + "\n\nThank you for shopping with DUKANAM!");
            } catch (Exception e) {
                System.out.println("Failed to send email: " + e.getMessage());
            }
        }
        if (order.getStore().getOwner().getEmailNotificationsEnabled() != null
                && order.getStore().getOwner().getEmailNotificationsEnabled()) {
            try {
                otpService.sendEmail(order.getStore().getOwner().getEmail(), "New Order Alert - DUKANAM",
                        "You have received a new order!\n\nOrder ID: #" + order.getOrderId() + "\nProducts: "
                                + productNames
                                + "\n\nPlease review and accept the order.");
            } catch (Exception e) {
                System.out.println("Failed to send email: " + e.getMessage());
            }
        }

        // Keep Console Log for Debug
        System.out.println(BLUE + "\n[NOTIFICATION SAVED] Order Confirmation for " + user.getEmail() + RESET);
    }

    public void sendOrderStatusUpdate(User user, Order order) {
        // Save to DB
        Notification notification = new Notification();
        notification.setRecipient(user);
        notification.setMessage("Update on Order #" + order.getOrderId() + ": " + order.getStatus());
        notification.setRelatedOrderId(order.getOrderId());
        notificationRepository.save(notification);

        // Send email if enabled
        if (user.getEmailNotificationsEnabled() != null && user.getEmailNotificationsEnabled()) {
            try {
                otpService.sendEmail(user.getEmail(), "Order Status Update - DUKANAM",
                        "Your order #" + order.getOrderId() + " status has been updated to: " + order.getStatus()
                                + "\n\nThank you for shopping with DUKANAM!");
            } catch (Exception e) {
                System.out.println("Failed to send email: " + e.getMessage());
            }
        }

        System.out.println(GREEN + "\n[NOTIFICATION SAVED] Status Update for " + user.getEmail() + RESET);
    }

    public void sendSupportReplyNotification(User user, Long ticketId, String messagePreview) {
        Notification notification = new Notification();
        notification.setRecipient(user);
        notification.setMessage("New reply on Support Ticket #" + ticketId + ": " + messagePreview);
        // We don't have a relatedTicketId field in Notification entity, so we can use
        // relatedOrderId or leave null if not applicable.
        // Or we can overload relatedOrderId to store ticketId if we want, or just rely
        // on the message.
        // For simplicity, let's just set the message.
        notificationRepository.save(notification);

        System.out.println(GREEN + "\n[NOTIFICATION SAVED] Support Reply for " + user.getEmail() + RESET);
    }

    public void sendProfileUpdateRequestNotification(User admin, User requester, Long requestId, String fieldName) {
        Notification notification = new Notification();
        notification.setRecipient(admin);
        notification.setMessage("Profile update request from " + requester.getFirstName() + " "
                + requester.getLastName() + " for " + fieldName);
        notification.setRelatedProfileRequestId(requestId);
        notificationRepository.save(notification);

        System.out.println(GREEN + "\n[NOTIFICATION SAVED] Profile Update Request for admin" + RESET);
    }

    public void sendProfileUpdateResponseNotification(User user, String fieldName, boolean approved) {
        Notification notification = new Notification();
        notification.setRecipient(user);
        String status = approved ? "approved" : "declined";
        notification.setMessage("Your " + fieldName + " change request has been " + status);
        notificationRepository.save(notification);

        // Send email if enabled
        if (user.getEmailNotificationsEnabled() != null && user.getEmailNotificationsEnabled()) {
            try {
                otpService.sendEmail(user.getEmail(),
                        "Profile Update " + (approved ? "Approved" : "Declined") + " - DUKANAM",
                        "Your request to update " + fieldName + " has been " + status
                                + ".\n\nThank you for using DUKANAM!");
            } catch (Exception e) {
                System.out.println("Failed to send email: " + e.getMessage());
            }
        }

        System.out.println(GREEN + "\n[NOTIFICATION SAVED] Profile Update Response for " + user.getEmail() + RESET);
    }
}
