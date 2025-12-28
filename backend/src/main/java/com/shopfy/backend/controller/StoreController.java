package com.shopfy.backend.controller;

import com.shopfy.backend.dto.StoreRequest;
import com.shopfy.backend.entity.Category;
import com.shopfy.backend.entity.Product;
import com.shopfy.backend.entity.Store;
import com.shopfy.backend.service.StoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/store")
@CrossOrigin(origins = "*")
public class StoreController {

    @Autowired
    private StoreService storeService;

    // 1. Create Store - Updated for File Upload
    @PostMapping("/register")
    public ResponseEntity<?> createStore(
            @RequestParam Long ownerId,
            @ModelAttribute StoreRequest request,
            @RequestParam(value = "logo", required = false) org.springframework.web.multipart.MultipartFile logo) {
        try {
            return ResponseEntity.ok(storeService.createStore(ownerId, request, logo));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. Get My Store
    @GetMapping("/my-store")
    public ResponseEntity<?> getMyStore(@RequestParam Long ownerId) {
        try {
            return ResponseEntity.ok(storeService.getStoreByOwner(ownerId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 3. Create Category
    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@RequestParam Long storeId, @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(storeService.createCategory(storeId, payload.get("categoryName")));
    }

    // Update Category
    @PutMapping("/categories/{categoryId}")
    public ResponseEntity<?> updateCategory(@PathVariable Long categoryId, @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(storeService.updateCategory(categoryId, payload.get("categoryName")));
    }

    // Delete Category
    @DeleteMapping("/categories/{categoryId}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long categoryId) {
        storeService.deleteCategory(categoryId);
        return ResponseEntity.ok("Category deleted");
    }

    // Update Category Section
    @PutMapping("/categories/{categoryId}/section")
    public ResponseEntity<?> updateCategorySection(@PathVariable Long categoryId,
            @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(storeService.updateCategorySection(categoryId, payload.get("section")));
    }

    // 4. Get Categories
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories(@RequestParam Long storeId) {
        return ResponseEntity.ok(storeService.getCategories(storeId));
    }

    // Subcategory Endpoints
    @PostMapping("/categories/{categoryId}/subcategories")
    public ResponseEntity<?> createSubcategory(@PathVariable Long categoryId,
            @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(storeService.createSubcategory(categoryId, payload.get("subcategoryName")));
    }

    @GetMapping("/categories/{categoryId}/subcategories")
    public ResponseEntity<?> getSubcategories(@PathVariable Long categoryId) {
        return ResponseEntity.ok(storeService.getSubcategories(categoryId));
    }

    @PutMapping("/subcategories/{subcategoryId}")
    public ResponseEntity<?> updateSubcategory(@PathVariable Long subcategoryId,
            @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(storeService.updateSubcategory(subcategoryId, payload.get("subcategoryName")));
    }

    @DeleteMapping("/subcategories/{subcategoryId}")
    public ResponseEntity<?> deleteSubcategory(@PathVariable Long subcategoryId) {
        storeService.deleteSubcategory(subcategoryId);
        return ResponseEntity.ok("Subcategory deleted");
    }

    // 1. Create OR Update Store (Logic handled in service or separate endpoint)
    // Let's separate Update to be clean
    @PutMapping("/update")
    public ResponseEntity<?> updateStore(
            @RequestParam Long ownerId,
            @ModelAttribute StoreRequest request,
            @RequestParam(value = "logo", required = false) org.springframework.web.multipart.MultipartFile logo) {
        try {
            return ResponseEntity.ok(storeService.updateStore(ownerId, request, logo));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ... (Get My Store, Categories remain same)

    // 5. Add Product with Multiple Images
    @PostMapping("/products")
    public ResponseEntity<?> addProduct(
            @RequestParam Long storeId,
            @RequestParam Long categoryId,
            @RequestParam(required = false) Long subcategoryId,
            @ModelAttribute Product product,
            @RequestParam(value = "images", required = false) List<org.springframework.web.multipart.MultipartFile> images) {
        return ResponseEntity.ok(storeService.addProduct(storeId, product, categoryId, subcategoryId, images));
    }

    // Update Product
    @PutMapping("/products/{productId}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long productId,
            @RequestParam Long storeId,
            @RequestParam Long categoryId,
            @RequestParam(required = false) Long subcategoryId,
            @ModelAttribute Product product,
            @RequestParam(value = "images", required = false) List<org.springframework.web.multipart.MultipartFile> images) {
        return ResponseEntity
                .ok(storeService.updateProduct(storeId, productId, product, categoryId, subcategoryId, images));
    }

    // 6. Get Products
    @GetMapping("/products")
    public ResponseEntity<List<Product>> getProducts(@RequestParam Long storeId) {
        return ResponseEntity.ok(storeService.getProducts(storeId));
    }

    // 7. Delete Product
    @DeleteMapping("/products/{productId}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long productId) {
        storeService.deleteProduct(productId);
        return ResponseEntity.ok("Product deleted");
    }
}
