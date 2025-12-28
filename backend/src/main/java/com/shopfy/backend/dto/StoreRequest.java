package com.shopfy.backend.dto;

import lombok.Data;

@Data
public class StoreRequest {
    private String storeName;
    private String storeAddress;
    private String contactNumber;
    private String storeLogoUrl;
    private Double latitude;
    private Double longitude;
}
