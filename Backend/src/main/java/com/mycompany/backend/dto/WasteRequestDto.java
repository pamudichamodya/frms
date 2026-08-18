package com.mycompany.backend.dto;

import java.math.BigDecimal;

public class WasteRequestDto {
    private Long ingredientId;
    private BigDecimal qtyWasted;
    private String wasteCategory;
    private String reason;
    private Long userId;

    public WasteRequestDto() {}

    public Long getIngredientId() { return ingredientId; }
    public void setIngredientId(Long ingredientId) { this.ingredientId = ingredientId; }

    public BigDecimal getQtyWasted() { return qtyWasted; }
    public void setQtyWasted(BigDecimal qtyWasted) { this.qtyWasted = qtyWasted; }

    public String getWasteCategory() { return wasteCategory; }
    public void setWasteCategory(String wasteCategory) { this.wasteCategory = wasteCategory; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}