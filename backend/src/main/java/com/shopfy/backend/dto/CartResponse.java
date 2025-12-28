package com.shopfy.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public class CartResponse {
    private Long cartId;
    private List<CartItemDTO> items;
    private BigDecimal totalAmount;

    public CartResponse(Long cartId, List<CartItemDTO> items, BigDecimal totalAmount) {
        this.cartId = cartId;
        this.items = items;
        this.totalAmount = totalAmount;
    }

    public Long getCartId() {
        return cartId;
    }

    public void setCartId(Long cartId) {
        this.cartId = cartId;
    }

    public List<CartItemDTO> getItems() {
        return items;
    }

    public void setItems(List<CartItemDTO> items) {
        this.items = items;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
}
