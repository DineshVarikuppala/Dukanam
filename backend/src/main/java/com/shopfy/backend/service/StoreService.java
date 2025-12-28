package com.shopfy.backend.service;

import com.shopfy.backend.dto.StoreRequest;
import com.shopfy.backend.entity.*;
import com.shopfy.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StoreService {

    @Autowired
    private StoreRepository storeRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private SubcategoryRepository subcategoryRepository;
    @Autowired
    private FileStorageService fileStorageService;

    // --- Store Management ---
    public Store createStore(Long ownerId, StoreRequest request, org.springframework.web.multipart.MultipartFile logo) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        if (storeRepository.findByOwner(owner).isPresent()) {
            throw new RuntimeException("Owner already has a store");
        }

        String logoUrl = null;
        if (logo != null && !logo.isEmpty()) {
            logoUrl = fileStorageService.saveFile(logo);
        } else {
            // Fallback if URL provided in text (though standard flow is upload now)
            logoUrl = request.getStoreLogoUrl();
        }

        Store store = new Store();
        store.setOwner(owner);
        store.setStoreName(request.getStoreName());
        store.setStoreAddress(request.getStoreAddress());
        store.setContactNumber(request.getContactNumber());
        store.setStoreLogoUrl(logoUrl);
        store.setLatitude(request.getLatitude());
        store.setLongitude(request.getLongitude());

        return storeRepository.save(store);
    }

    public Store getStoreByOwner(Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));
        return storeRepository.findByOwner(owner)
                .orElseThrow(() -> new RuntimeException("Store not found for this owner"));
    }

    // --- Category Management ---
    public Category createCategory(Long storeId, String categoryName) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found"));

        Category category = new Category();
        category.setStore(store);
        category.setCategoryName(categoryName);
        return categoryRepository.save(category);
    }

    public Category updateCategory(Long categoryId, String newName) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setCategoryName(newName);
        return categoryRepository.save(category);
    }

    public void deleteCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // First, delete all subcategories associated with this category
        List<Subcategory> subcategories = subcategoryRepository.findByCategory(category);
        for (Subcategory subcategory : subcategories) {
            // Update products that use this subcategory to set subcategory to null
            List<Product> productsWithSubcategory = productRepository.findAll().stream()
                    .filter(p -> p.getSubcategory() != null
                            && p.getSubcategory().getSubcategoryId().equals(subcategory.getSubcategoryId()))
                    .toList();
            for (Product product : productsWithSubcategory) {
                product.setSubcategory(null);
                productRepository.save(product);
            }
            subcategoryRepository.delete(subcategory);
        }

        // Update products that use this category to set category to null
        List<Product> productsWithCategory = productRepository.findAll().stream()
                .filter(p -> p.getCategory() != null && p.getCategory().getCategoryId().equals(categoryId))
                .toList();
        for (Product product : productsWithCategory) {
            product.setCategory(null);
            productRepository.save(product);
        }

        // Finally, delete the category
        categoryRepository.deleteById(categoryId);
    }

    public List<Category> getCategories(Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found"));
        return categoryRepository.findByStore(store);
    }

    public Category updateCategorySection(Long categoryId, String section) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setSection(section);
        return categoryRepository.save(category);
    }

    // --- Subcategory Management ---
    public Subcategory createSubcategory(Long categoryId, String subcategoryName) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Subcategory subcategory = new Subcategory();
        subcategory.setCategory(category);
        subcategory.setSubcategoryName(subcategoryName);
        return subcategoryRepository.save(subcategory);
    }

    public List<Subcategory> getSubcategories(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return subcategoryRepository.findByCategory(category);
    }

    public Subcategory updateSubcategory(Long subcategoryId, String newName) {
        Subcategory subcategory = subcategoryRepository.findById(subcategoryId)
                .orElseThrow(() -> new RuntimeException("Subcategory not found"));
        subcategory.setSubcategoryName(newName);
        return subcategoryRepository.save(subcategory);
    }

    public void deleteSubcategory(Long subcategoryId) {
        subcategoryRepository.deleteById(subcategoryId);
    }

    public Store updateStore(Long ownerId, StoreRequest request, org.springframework.web.multipart.MultipartFile logo) {
        Store store = getStoreByOwner(ownerId); // Validates existence

        store.setStoreName(request.getStoreName());
        store.setStoreAddress(request.getStoreAddress());
        store.setContactNumber(request.getContactNumber());
        if (request.getLatitude() != null)
            store.setLatitude(request.getLatitude());
        if (request.getLongitude() != null)
            store.setLongitude(request.getLongitude());

        if (logo != null && !logo.isEmpty()) {
            String logoUrl = fileStorageService.saveFile(logo);
            store.setStoreLogoUrl(logoUrl);
        }

        return storeRepository.save(store);
    }

    // --- Product Management ---
    public Product addProduct(Long storeId, Product product, Long categoryId, Long subcategoryId,
            List<org.springframework.web.multipart.MultipartFile> images) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found"));
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        product.setStore(store);
        product.setCategory(category);

        // Set subcategory if provided
        if (subcategoryId != null) {
            Subcategory subcategory = subcategoryRepository.findById(subcategoryId)
                    .orElseThrow(() -> new RuntimeException("Subcategory not found"));
            product.setSubcategory(subcategory);
        }

        if (product.getQuantityInStock() == null)
            product.setQuantityInStock(0);

        // Handle Images
        if (images != null && !images.isEmpty()) {
            List<String> urls = new java.util.ArrayList<>();
            for (org.springframework.web.multipart.MultipartFile img : images) {
                if (!img.isEmpty()) {
                    urls.add(fileStorageService.saveFile(img));
                }
            }
            product.setImageUrls(urls);
        }

        return productRepository.save(product);
    }

    public List<Product> getProducts(Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found"));
        return productRepository.findByStore(store);
    }

    public Product updateProduct(Long storeId, Long productId, Product productDetails, Long categoryId,
            Long subcategoryId,
            List<org.springframework.web.multipart.MultipartFile> images) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getStore().getStoreId().equals(store.getStoreId())) {
            throw new RuntimeException("Product does not belong to this store");
        }

        // Update basic fields
        product.setProductName(productDetails.getProductName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setQuantityInStock(productDetails.getQuantityInStock());

        // Update Category if changed
        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }

        // Update Subcategory if provided
        if (subcategoryId != null) {
            Subcategory subcategory = subcategoryRepository.findById(subcategoryId)
                    .orElseThrow(() -> new RuntimeException("Subcategory not found"));
            product.setSubcategory(subcategory);
        } else {
            product.setSubcategory(null);
        }

        // Handle Images (Replace strategy for simple edit)
        if (images != null && !images.isEmpty()) {
            List<String> urls = new java.util.ArrayList<>();
            for (org.springframework.web.multipart.MultipartFile img : images) {
                if (!img.isEmpty()) {
                    urls.add(fileStorageService.saveFile(img));
                }
            }
            product.setImageUrls(urls);
        }

        return productRepository.save(product);
    }

    public void deleteProduct(Long productId) {
        productRepository.deleteById(productId);
    }
}
