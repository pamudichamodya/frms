package com.mycompany.backend.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProductRequestDto {
    private String name;
    private BigDecimal sellingPrice;
    private String category;
    private List<ProductIngredientDto> ingredients = new ArrayList<>();

    public ProductRequestDto() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getSellingPrice() { return sellingPrice; }
    public void setSellingPrice(BigDecimal sellingPrice) { this.sellingPrice = sellingPrice; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public List<ProductIngredientDto> getIngredients() { return ingredients; }
    public void setIngredients(List<ProductIngredientDto> ingredients) { this.ingredients = ingredients; }
}