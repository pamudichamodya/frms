package com.mycompany.backend.dto;

import java.math.BigDecimal;

public class ProductIngredientDto {
    private Long ingredientId;
    private String ingredientName;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal qtyPerUnit;
    private BigDecimal lineCost;

    public ProductIngredientDto() {}

    public ProductIngredientDto(Long ingredientId, String ingredientName, String unit, 
                                BigDecimal unitPrice, BigDecimal qtyPerUnit) {
        this.ingredientId = ingredientId;
        this.ingredientName = ingredientName;
        this.unit = unit;
        this.unitPrice = unitPrice;
        this.qtyPerUnit = qtyPerUnit;
        if (unitPrice != null && qtyPerUnit != null) {
            this.lineCost = unitPrice.multiply(qtyPerUnit);
        }
    }

    public Long getIngredientId() { return ingredientId; }
    public void setIngredientId(Long ingredientId) { this.ingredientId = ingredientId; }

    public String getIngredientName() { return ingredientName; }
    public void setIngredientName(String ingredientName) { this.ingredientName = ingredientName; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

    public BigDecimal getQtyPerUnit() { return qtyPerUnit; }
    public void setQtyPerUnit(BigDecimal qtyPerUnit) { this.qtyPerUnit = qtyPerUnit; }

    public BigDecimal getLineCost() { return lineCost; }
    public void setLineCost(BigDecimal lineCost) { this.lineCost = lineCost; }
}