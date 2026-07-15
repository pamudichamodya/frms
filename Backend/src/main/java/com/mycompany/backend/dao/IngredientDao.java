package com.mycompany.backend.dao;

import com.mycompany.backend.model.Ingredient;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.LockModeType;

@ApplicationScoped
public class IngredientDao extends GenericDao<Ingredient, Long> {

    public IngredientDao() {
        super(Ingredient.class);
    }

    // Ingredient.id is a Long (see @Id in Ingredient.java) — the PK object
    // passed to em.find() must match that exactly, so no intValue() here.
    public Ingredient findByIdWithLock(Long id) {
        if (id == null) return null;
        return em.find(Ingredient.class, id, LockModeType.PESSIMISTIC_WRITE);
    }
}