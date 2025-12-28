package com.shopfy.backend.service;

import com.shopfy.backend.entity.Address;
import com.shopfy.backend.repository.AddressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AddressService {

    @Autowired
    private AddressRepository addressRepository;

    public List<Address> getUserAddresses(Long userId) {
        return addressRepository.findByUserId(userId);
    }

    public Address getAddressById(Long addressId) {
        return addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
    }

    @Transactional
    public Address createAddress(Address address) {
        // If this is set as default, unset other defaults for this user
        if (address.getIsDefault()) {
            List<Address> userAddresses = addressRepository.findByUserId(address.getUserId());
            userAddresses.forEach(addr -> {
                addr.setIsDefault(false);
                addressRepository.save(addr);
            });
        }
        return addressRepository.save(address);
    }

    @Transactional
    public Address updateAddress(Long addressId, Address updatedAddress) {
        Address address = getAddressById(addressId);
        address.setLabel(updatedAddress.getLabel());
        address.setFullAddress(updatedAddress.getFullAddress());

        // If setting as default, unset other defaults
        if (updatedAddress.getIsDefault() && !address.getIsDefault()) {
            List<Address> userAddresses = addressRepository.findByUserId(address.getUserId());
            userAddresses.forEach(addr -> {
                if (!addr.getAddressId().equals(addressId)) {
                    addr.setIsDefault(false);
                    addressRepository.save(addr);
                }
            });
        }
        address.setIsDefault(updatedAddress.getIsDefault());

        return addressRepository.save(address);
    }

    public void deleteAddress(Long addressId) {
        addressRepository.deleteById(addressId);
    }

    public Address getDefaultAddress(Long userId) {
        return addressRepository.findByUserIdAndIsDefaultTrue(userId).orElse(null);
    }
}
