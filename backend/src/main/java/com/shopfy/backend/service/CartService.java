package com.shopfy.backend.service;

import com.shopfy.backend.dto.AddToCartRequest;
import com.shopfy.backend.dto.CartItemDTO;
import com.shopfy.backend.dto.CartResponse;
import com.shopfy.backend.entity.Cart;
import com.shopfy.backend.entity.CartItem;
import com.shopfy.backend.entity.Product;
import com.shopfy.backend.entity.User;
import com.shopfy.backend.repository.CartItemRepository;
import com.shopfy.backend.repository.CartRepository;
import com.shopfy.backend.repository.ProductRepository;
import com.shopfy.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void addToCart(Long userId, AddToCartRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getProductId().equals(product.getProductId()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            cartItemRepository.save(item);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(request.getQuantity());
            cartItemRepository.save(newItem);
        }
    }

    @Transactional
    public void removeFromCart(Long userId, Long cartItemId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // Security check
        if (!item.getCart().getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to cart item");
        }

        cartItemRepository.delete(item);
    }

    @Transactional
    public void updateCartItemQuantity(Long userId, Long cartItemId, int quantity) {
        if (quantity <= 0) {
            removeFromCart(userId, cartItemId);
            return;
        }

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        if (!item.getCart().getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to cart item");
        }

        item.setQuantity(quantity);
        cartItemRepository.save(item);
    }

    public CartResponse getCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });

        List<CartItemDTO> itemDTOs = cart.getItems().stream().map(item -> {
            String imageUrl = item.getProduct().getImageUrls().isEmpty() ? null
                    : item.getProduct().getImageUrls().get(0);
            return new CartItemDTO(
                    item.getCartItemId(),
                    item.getProduct().getProductId(),
                    item.getProduct().getProductName(),
                    item.getProduct().getPrice(),
                    item.getQuantity(),
                    imageUrl,
                    item.getProduct().getStore().getStoreId(),
                    item.getProduct().getStore().getStoreName());
        }).collect(Collectors.toList());

        BigDecimal total = itemDTOs.stream()
                .map(i -> i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(cart.getCartId(), itemDTOs, total);
    }
}
