package com.mycompany.backend.dto;

import java.math.BigDecimal;

public class IngredientResponseDto {
    private Long id;
    private String name;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal thresholdQty;
    private BigDecimal currentQty;
    private String category;
    private boolean lowStock;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public BigDecimal getThresholdQty() { return thresholdQty; }
    public void setThresholdQty(BigDecimal thresholdQty) { this.thresholdQty = thresholdQty; }
    public BigDecimal getCurrentQty() { return currentQty; }
    public void setCurrentQty(BigDecimal currentQty) { this.currentQty = currentQty; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public boolean isLowStock() { return lowStock; }
    public void setLowStock(boolean lowStock) { this.lowStock = lowStock; }
}