package com.shopfy.backend.controller;

import com.shopfy.backend.dto.AddToCartRequest;
import com.shopfy.backend.dto.CartResponse;
import com.shopfy.backend.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    @Autowired
    private CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<String> addToCart(@RequestParam Long userId,
            @RequestBody AddToCartRequest request) {
        cartService.addToCart(userId, request);
        return ResponseEntity.ok("Item added to cart");
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> removeFromCart(@RequestParam Long userId, @PathVariable Long itemId) {
        cartService.removeFromCart(userId, itemId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<Void> updateItemQuantity(@RequestParam Long userId, @PathVariable Long itemId,
            @RequestParam int quantity) {
        cartService.updateCartItemQuantity(userId, itemId, quantity);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@RequestParam Long userId) {
        return ResponseEntity.ok(cartService.getCart(userId));
    }
}
