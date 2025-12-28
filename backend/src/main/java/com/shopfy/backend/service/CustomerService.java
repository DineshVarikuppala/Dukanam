package com.shopfy.backend.service;

import com.shopfy.backend.entity.Category;
import com.shopfy.backend.entity.Product;
import com.shopfy.backend.entity.Store;
import com.shopfy.backend.repository.CategoryRepository;
import com.shopfy.backend.repository.ProductRepository;
import com.shopfy.backend.repository.StoreRepository;
import com.shopfy.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    public List<Store> getAllStores() {
        return storeRepository.findAll();
    }

    public Store getStoreById(Long storeId) {
        return storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found"));
    }

    public List<Category> getStoreCategories(Long storeId) {
        Store store = getStoreById(storeId);
        return categoryRepository.findByStore(store);
    }

    public List<Product> getStoreProducts(Long storeId) {
        Store store = getStoreById(storeId);
        return productRepository.findByStore(store);
    }

    public List<Product> searchProducts(String query) {
        return productRepository.findByProductNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query);
    }

    public Product getProductById(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public java.util.Map<String, List<Product>> getAllProductsByCategory() {
        List<Product> allProducts = productRepository.findAll();
        java.util.Map<String, List<Product>> productsByCategory = new java.util.LinkedHashMap<>();

        for (Product product : allProducts) {
            if (product.isActive() && product.getCategory() != null) {
                String categoryName = product.getCategory().getCategoryName();
                productsByCategory.computeIfAbsent(categoryName, k -> new java.util.ArrayList<>()).add(product);
            }
        }

        return productsByCategory;
    }

    public List<Product> getBestsellingProducts() {
        List<Product> allProducts = productRepository.findAll();

        // Filter active products and sort by order count (descending)
        return allProducts.stream()
                .filter(Product::isActive)
                .sorted((p1, p2) -> {
                    long count1 = getProductOrderCount(p1.getProductId());
                    long count2 = getProductOrderCount(p2.getProductId());
                    return Long.compare(count2, count1); // Descending order
                })
                .collect(java.util.stream.Collectors.toList());
    }

    private long getProductOrderCount(Long productId) {
        // Count how many times this product has been ordered
        return orderRepository.findAll().stream()
                .flatMap(order -> order.getItems().stream())
                .filter(item -> item.getProduct().getProductId().equals(productId))
                .count();
    }
}
