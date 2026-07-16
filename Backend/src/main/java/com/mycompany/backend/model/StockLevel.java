package com.mycompany.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Maps to the stock_levels table. This table is the single source of
 * truth for how much of an ingredient is currently in stock — it is
 * maintained automatically by the trg_stock_movements_after_insert
 * database trigger every time a row is inserted into stock_movements.
 * Application code should read from here, and should never maintain
 * its own separate running total of stock.
 */
@Entity
@Table(name = "stock_levels")
public class StockLevel {

    @Id
    @Column(name = "ingredient_id")
    private Long ingredientId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "ingredient_id")
    private Ingredient ingredient;

    @Column(name = "current_qty", precision = 12, scale = 3)
    private BigDecimal currentQty = BigDecimal.ZERO;

    @Column(name = "last_updated", insertable = false, updatable = false)
    private LocalDateTime lastUpdated;

    public Long getIngredientId() { return ingredientId; }
    public void setIngredientId(Long ingredientId) { this.ingredientId = ingredientId; }

    public Ingredient getIngredient() { return ingredient; }
    public void setIngredient(Ingredient ingredient) { this.ingredient = ingredient; }

    public BigDecimal getCurrentQty() { return currentQty; }
    public void setCurrentQty(BigDecimal currentQty) { this.currentQty = currentQty; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}