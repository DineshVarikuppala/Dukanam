package com.shopfy.backend.controller;

import com.shopfy.backend.entity.Category;
import com.shopfy.backend.entity.Product;
import com.shopfy.backend.entity.Store;
import com.shopfy.backend.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = "*")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @GetMapping("/stores")
    public ResponseEntity<List<Store>> getAllStores() {
        return ResponseEntity.ok(customerService.getAllStores());
    }

    @GetMapping("/stores/{storeId}")
    public ResponseEntity<Store> getStore(@PathVariable Long storeId) {
        return ResponseEntity.ok(customerService.getStoreById(storeId));
    }

    @GetMapping("/stores/{storeId}/categories")
    public ResponseEntity<List<Category>> getCategories(@PathVariable Long storeId) {
        return ResponseEntity.ok(customerService.getStoreCategories(storeId));
    }

    @GetMapping("/stores/{storeId}/products")
    public ResponseEntity<List<Product>> getProducts(@PathVariable Long storeId) {
        return ResponseEntity.ok(customerService.getStoreProducts(storeId));
    }

    @GetMapping("/products/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String query) {
        return ResponseEntity.ok(customerService.searchProducts(query));
    }

    @GetMapping("/products/all-by-category")
    public ResponseEntity<java.util.Map<String, List<Product>>> getAllProductsByCategory() {
        return ResponseEntity.ok(customerService.getAllProductsByCategory());
    }

    @GetMapping("/products/bestsellers")
    public ResponseEntity<List<Product>> getBestsellers() {
        return ResponseEntity.ok(customerService.getBestsellingProducts());
    }

    @GetMapping("/products/{productId}")
    public ResponseEntity<Product> getProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(customerService.getProductById(productId));
    }
}
