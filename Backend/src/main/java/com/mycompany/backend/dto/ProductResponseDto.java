package com.mycompany.backend.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProductResponseDto {
    private Long id;
    private String name;
    private BigDecimal sellingPrice;
    private String category;
    private BigDecimal costPrice;      // Sum of (ingredient qty * ingredient unit price)
    private BigDecimal profitMargin;   // sellingPrice - costPrice
    private Integer availableQty;      // Max portions available to sell based on current stock
    private List<ProductIngredientDto> ingredients = new ArrayList<>();

    public ProductResponseDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getSellingPrice() { return sellingPrice; }
    public void setSellingPrice(BigDecimal sellingPrice) { this.sellingPrice = sellingPrice; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getCostPrice() { return costPrice; }
    public void setCostPrice(BigDecimal costPrice) { this.costPrice = costPrice; }

    public BigDecimal getProfitMargin() { return profitMargin; }
    public void setProfitMargin(BigDecimal profitMargin) { this.profitMargin = profitMargin; }

    public Integer getAvailableQty() { return availableQty; }
    public void setAvailableQty(Integer availableQty) { this.availableQty = availableQty; }

    public List<ProductIngredientDto> getIngredients() { return ingredients; }
    public void setIngredients(List<ProductIngredientDto> ingredients) { this.ingredients = ingredients; }
}