package com.shopfy.backend.controller;

import com.shopfy.backend.entity.Address;
import com.shopfy.backend.service.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@CrossOrigin(origins = "*")
public class AddressController {

    @Autowired
    private AddressService addressService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Address>> getUserAddresses(@PathVariable Long userId) {
        return ResponseEntity.ok(addressService.getUserAddresses(userId));
    }

    @GetMapping("/{addressId}")
    public ResponseEntity<Address> getAddress(@PathVariable Long addressId) {
        return ResponseEntity.ok(addressService.getAddressById(addressId));
    }

    @PostMapping
    public ResponseEntity<Address> createAddress(@RequestBody Address address) {
        return ResponseEntity.ok(addressService.createAddress(address));
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<Address> updateAddress(@PathVariable Long addressId, @RequestBody Address address) {
        return ResponseEntity.ok(addressService.updateAddress(addressId, address));
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long addressId) {
        addressService.deleteAddress(addressId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/{userId}/default")
    public ResponseEntity<Address> getDefaultAddress(@PathVariable Long userId) {
        Address defaultAddress = addressService.getDefaultAddress(userId);
        if (defaultAddress != null) {
            return ResponseEntity.ok(defaultAddress);
        }
        return ResponseEntity.notFound().build();
    }
}
