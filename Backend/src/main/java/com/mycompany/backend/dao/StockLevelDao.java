package com.mycompany.backend.dao;

import com.mycompany.backend.model.StockLevel;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.LockModeType;
import java.util.List;

@ApplicationScoped
public class StockLevelDao extends GenericDao<StockLevel, Long> {

    public StockLevelDao() {
        super(StockLevel.class);
    }

    /**
     * Returns null if the ingredient has never had a stock movement yet
     * (the stock_levels row is only created by the trigger on the first
     * IN/OUT/WASTE movement) — callers should treat a null result as zero.
     */
    public StockLevel findByIngredientId(Long ingredientId) {
        if (ingredientId == null) return null;
        return em.find(StockLevel.class, ingredientId);
    }

    public StockLevel findByIngredientIdWithLock(Long ingredientId) {
        if (ingredientId == null) return null;
        return em.find(StockLevel.class, ingredientId, LockModeType.PESSIMISTIC_WRITE);
    }

    public List<StockLevel> findLowStock() {
        return em.createQuery(
            "SELECT sl FROM StockLevel sl JOIN FETCH sl.ingredient i WHERE sl.currentQty <= i.thresholdQty",
            StockLevel.class)
            .getResultList();
    }
}