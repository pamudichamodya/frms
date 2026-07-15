package com.mycompany.backend.dto;

import java.math.BigDecimal;

public class IngredientRequestDto {
    private String name;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal thresholdQty;
    private String category;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public BigDecimal getThresholdQty() { return thresholdQty; }
    public void setThresholdQty(BigDecimal thresholdQty) { this.thresholdQty = thresholdQty; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}