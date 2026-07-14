package com.mycompany.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "ingredients")
public class Ingredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 20)
    private String unit;

    @Column(name = "unit_price", precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "threshold_qty", precision = 10, scale = 2)
    private BigDecimal thresholdQty;

    @Column(length = 50)
    private String category;

    public Ingredient() {}

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

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}