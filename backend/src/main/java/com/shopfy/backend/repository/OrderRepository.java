package com.shopfy.backend.repository;

import com.shopfy.backend.entity.Order;
import com.shopfy.backend.entity.User;
import com.shopfy.backend.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomer(User customer);

    List<Order> findByStore(Store store);

    List<Order> findByCustomerUserId(Long customerId);

    List<Order> findByStoreStoreId(Long storeId);

    // Find all orders for stores owned by a specific user
    @Query("SELECT o FROM Order o WHERE o.store.owner.userId = :ownerId")
    List<Order> findByStoreOwnerUserId(@Param("ownerId") Long ownerId);
}
