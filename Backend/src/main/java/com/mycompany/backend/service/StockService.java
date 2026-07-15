package com.mycompany.backend.service;

import com.mycompany.backend.dao.IngredientDao;
import com.mycompany.backend.dao.StockLevelDao;
import com.mycompany.backend.dao.StockMovementDao;
import com.mycompany.backend.dto.IngredientRequestDto;
import com.mycompany.backend.dto.IngredientResponseDto;
import com.mycompany.backend.enums.MovementType;
import com.mycompany.backend.model.Ingredient;
import com.mycompany.backend.model.StockLevel;
import com.mycompany.backend.model.StockMovement;
import com.mycompany.backend.model.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.PersistenceException;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class StockService {

    @PersistenceContext(unitName = "FRMS_PU")
    private EntityManager em;

    @Inject
    private IngredientDao ingredientDao;

    @Inject
    private StockMovementDao stockMovementDao;

    @Inject
    private StockLevelDao stockLevelDao;

    @Transactional
    public IngredientResponseDto createIngredient(IngredientRequestDto dto) {
        Ingredient ingredient = new Ingredient();
        ingredient.setName(dto.getName());
        ingredient.setUnit(dto.getUnit());
        ingredient.setUnitPrice(dto.getUnitPrice());
        ingredient.setThresholdQty(dto.getThresholdQty());
        ingredient.setCategory(dto.getCategory());

        ingredientDao.create(ingredient);
        return mapToResponse(ingredient);
    }

    @Transactional
    public void recordStockIntake(Long ingredientId, BigDecimal qty, String reference, Long userId) {
        if (qty == null || qty.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Intake quantity must be greater than zero");
        }

        Ingredient ingredient = ingredientDao.findByIdWithLock(ingredientId);
        if (ingredient == null) {
            throw new IllegalArgumentException("Ingredient not found");
        }

        User user = em.find(User.class, userId);
        if (user == null) {
            throw new IllegalArgumentException("User not found with ID: " + userId);
        }

        // Just log the movement. trg_stock_movements_after_insert (DB trigger)
        // updates stock_levels.current_qty and raises low-stock alerts
        // automatically — do not also update stock here, or every intake
        // gets double-booked against a second, disconnected counter.
        StockMovement movement = new StockMovement();
        movement.setIngredient(ingredient);
        movement.setMovementType(MovementType.IN);
        movement.setQty(qty);
        movement.setReference(reference);
        movement.setUser(user);

        stockMovementDao.create(movement);
    }

    public List<IngredientResponseDto> getAllIngredients() {
        return ingredientDao.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<IngredientResponseDto> getLowStockAlerts() {
        return stockLevelDao.findLowStock().stream()
                .map(sl -> mapToResponse(sl.getIngredient()))
                .collect(Collectors.toList());
    }

    // 1. Get Ingredient by ID
    public IngredientResponseDto getIngredientById(Long id) {
        Ingredient ingredient = ingredientDao.findById(id);
        if (ingredient == null) {
            return null;
        }
        return mapToResponse(ingredient);
    }

    // 2. Update Ingredient
    @Transactional
    public IngredientResponseDto updateIngredient(Long id, IngredientRequestDto dto) {
        Ingredient ingredient = ingredientDao.findById(id);
        if (ingredient == null) {
            return null;
        }

        ingredient.setName(dto.getName());
        ingredient.setUnit(dto.getUnit());
        ingredient.setUnitPrice(dto.getUnitPrice());
        ingredient.setThresholdQty(dto.getThresholdQty());
        ingredient.setCategory(dto.getCategory());

        ingredientDao.update(ingredient);
        return mapToResponse(ingredient);
    }

    // 3. Delete Ingredient
    @Transactional
    public void deleteIngredient(Long id) {
        Ingredient ingredient = ingredientDao.findById(id);
        if (ingredient == null) {
            return;
        }

        try {
            ingredientDao.delete(ingredient);
            // Force the DELETE to run now, inside this try block. Left to the
            // container's commit (which happens after this method returns),
            // the FK violation surfaces as an uncaught 500 with no chance to
            // translate it into a clean message for the caller.
            em.flush();
        } catch (PersistenceException e) {
            throw new IllegalArgumentException(
                "Cannot delete '" + ingredient.getName() + "': it already has stock "
                + "movement history (intakes, sales, or waste). Consider archiving it "
                + "instead of deleting it.");
        }
    }

    // 4. Get Stock Movements
    public List<StockMovement> getStockMovements(Long ingredientId) {
        return stockMovementDao.findByIngredientId(ingredientId);
    }

    private IngredientResponseDto mapToResponse(Ingredient ingredient) {
        IngredientResponseDto dto = new IngredientResponseDto();
        dto.setId(ingredient.getId());
        dto.setName(ingredient.getName());
        dto.setUnit(ingredient.getUnit());
        dto.setUnitPrice(ingredient.getUnitPrice());
        dto.setThresholdQty(ingredient.getThresholdQty());
        dto.setCategory(ingredient.getCategory());

        // A brand-new ingredient has no stock_levels row yet (the DB trigger
        // only creates one on the first movement) — that means zero stock,
        // not an error.
        StockLevel stockLevel = stockLevelDao.findByIngredientId(ingredient.getId());
        BigDecimal current = stockLevel != null && stockLevel.getCurrentQty() != null
                ? stockLevel.getCurrentQty() : BigDecimal.ZERO;
        BigDecimal threshold = ingredient.getThresholdQty() != null ? ingredient.getThresholdQty() : BigDecimal.ZERO;

        dto.setCurrentQty(current);
        dto.setLowStock(current.compareTo(threshold) <= 0);
        return dto;
    }
}