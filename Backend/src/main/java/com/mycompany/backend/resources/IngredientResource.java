package com.mycompany.backend.resources;

import com.mycompany.backend.dto.IngredientRequestDto;
import com.mycompany.backend.dto.IngredientResponseDto;
import com.mycompany.backend.model.StockMovement;
import com.mycompany.backend.service.StockService;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.math.BigDecimal;
import java.util.List;

@Path("/stock")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class IngredientResource {

    @Inject
    private StockService stockService;

    /**
     * GET /resources/stock
     * Retrieves all ingredients.
     */
    @GET
    public Response getAllIngredients() {
        List<IngredientResponseDto> ingredients = stockService.getAllIngredients();
        return Response.ok(ingredients).build();
    }

    /**
     * GET /resources/stock/alerts
     * Retrieves ingredients currently at or below their low-stock threshold.
     * Declared before the "/{id}" route so the literal "alerts" segment
     * doesn't get swallowed by the id path param.
     */
    @GET
    @Path("/alerts")
    public Response getLowStockAlerts() {
        List<IngredientResponseDto> alerts = stockService.getLowStockAlerts();
        return Response.ok(alerts).build();
    }

    /**
     * POST /resources/stock/intake
     * Records a stock intake (delivery) against an ingredient.
     */
    @POST
    @Path("/intake")
    public Response recordStockIntake(
            @QueryParam("ingredientId") Long ingredientId,
            @QueryParam("qty") BigDecimal qty,
            @QueryParam("reference") String reference,
            @QueryParam("userId") Long userId) {
        try {
            stockService.recordStockIntake(ingredientId, qty, reference, userId);
            return Response.ok().build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                           .entity(e.getMessage())
                           .build();
        }
    }

    /**
     * GET /resources/stock/{id}
     * Retrieves a single ingredient by ID.
     */
    @GET
    @Path("/{id}")
    public Response getIngredientById(@PathParam("id") Long id) {
        IngredientResponseDto ingredient = stockService.getIngredientById(id);
        if (ingredient == null) {
            return Response.status(Response.Status.NOT_FOUND)
                           .entity("Ingredient not found with ID: " + id)
                           .build();
        }
        return Response.ok(ingredient).build();
    }

    /**
     * POST /api/ingredients
     * Creates a new ingredient.
     */
    @POST
    public Response createIngredient(IngredientRequestDto dto) {
        IngredientResponseDto created = stockService.createIngredient(dto);
        return Response.status(Response.Status.CREATED)
                       .entity(created)
                       .build();
    }

    /**
     * PUT /api/ingredients/{id}
     * Updates an existing ingredient by ID.
     */
    @PUT
    @Path("/{id}")
    public Response updateIngredient(@PathParam("id") Long id, IngredientRequestDto dto) {
        IngredientResponseDto updated = stockService.updateIngredient(id, dto);
        if (updated == null) {
            return Response.status(Response.Status.NOT_FOUND)
                           .entity("Ingredient not found with ID: " + id)
                           .build();
        }
        return Response.ok(updated).build();
    }

    /**
     * DELETE /api/ingredients/{id}
     * Deletes an ingredient by ID.
     * 
     * FIX APPLIED: Separated the void method execution from the Response builder 
     * to eliminate the compiler error 'void type not allowed here'.
     */
    @DELETE
    @Path("/{id}")
    public Response deleteIngredient(@PathParam("id") Long id) {
        try {
            stockService.deleteIngredient(id);
            return Response.noContent().build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.CONFLICT)
                           .entity(e.getMessage())
                           .build();
        }
    }

    /**
     * GET /api/ingredients/{id}/movements
     * Retrieves stock movements for a specific ingredient.
     */
    @GET
    @Path("/{id}/movements")
    public Response getStockMovements(@PathParam("id") Long id) {
        List<StockMovement> movements = stockService.getStockMovements(id);
        return Response.ok(movements).build();
    }
}