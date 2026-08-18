package com.mycompany.backend.dto;

import java.math.BigDecimal;

public class SaleRequestDto {
    private Long productId;
    
    // FIX: Must be BigDecimal, NOT Integer
    private BigDecimal qtySold; 
    
    private Long userId;

    public SaleRequestDto() {}

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public BigDecimal getQtySold() { return qtySold; }
    public void setQtySold(BigDecimal qtySold) { this.qtySold = qtySold; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}