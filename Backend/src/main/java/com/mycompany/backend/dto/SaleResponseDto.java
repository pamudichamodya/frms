package com.mycompany.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class SaleResponseDto {
    private Long id;
    private Long productId;
    private String productName;
    
    // FIX: Must be BigDecimal, NOT Integer
    private BigDecimal qtySold;
    
    private BigDecimal salePrice;
    private LocalDateTime timestamp;
    private Long userId;
    private String userName;

    public SaleResponseDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public BigDecimal getQtySold() { return qtySold; }
    public void setQtySold(BigDecimal qtySold) { this.qtySold = qtySold; }

    public BigDecimal getSalePrice() { return salePrice; }
    public void setSalePrice(BigDecimal salePrice) { this.salePrice = salePrice; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
}