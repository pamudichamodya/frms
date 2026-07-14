package com.mycompany.backend.model;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class ProductIngredientId implements Serializable {

    private Long productId;
    private Long ingredientId;

    public ProductIngredientId() {
    }

    public ProductIngredientId(Long productId, Long ingredientId) {
        this.productId = productId;
        this.ingredientId = ingredientId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Long getIngredientId() {
        return ingredientId;
    }

    public void setIngredientId(Long ingredientId) {
        this.ingredientId = ingredientId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;

        if (!(o instanceof ProductIngredientId)) {
            return false;
        }

        ProductIngredientId that = (ProductIngredientId) o;

        return Objects.equals(productId, that.productId)
                && Objects.equals(ingredientId, that.ingredientId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(productId, ingredientId);
    }
}