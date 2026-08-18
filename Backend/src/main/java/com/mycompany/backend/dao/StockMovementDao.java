package com.mycompany.backend.dao;

import com.mycompany.backend.model.StockMovement;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class StockMovementDao extends GenericDao<StockMovement, Long> {

    public StockMovementDao() {
        super(StockMovement.class);
    }

    public List<StockMovement> findByIngredientId(Long  ingredientId) {
        return em.createQuery(
            "SELECT sm FROM StockMovement sm WHERE sm.ingredient.id = :ingredientId ORDER BY sm.timestamp DESC", 
            StockMovement.class)
            .setParameter("ingredientId", ingredientId)
            .getResultList();
    }

    @Override
    public List<StockMovement> findAll() {
        return em.createQuery("SELECT sm FROM StockMovement sm ORDER BY sm.timestamp DESC", StockMovement.class)
                 .getResultList();
    }
}