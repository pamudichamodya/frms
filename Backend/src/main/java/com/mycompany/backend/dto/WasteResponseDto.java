package com.mycompany.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class WasteResponseDto {
    private Long id;
    private String ingredientName;
    private BigDecimal qtyWasted;
    private String wasteCategory;
    private String reason;
    private LocalDateTime timestamp;
    private String userName;

    public WasteResponseDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIngredientName() { return ingredientName; }
    public void setIngredientName(String ingredientName) { this.ingredientName = ingredientName; }

    public BigDecimal getQtyWasted() { return qtyWasted; }
    public void setQtyWasted(BigDecimal qtyWasted) { this.qtyWasted = qtyWasted; }

    public String getWasteCategory() { return wasteCategory; }
    public void setWasteCategory(String wasteCategory) { this.wasteCategory = wasteCategory; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
}