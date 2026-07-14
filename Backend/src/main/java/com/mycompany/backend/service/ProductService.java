package com.mycompany.backend.service;

import com.mycompany.backend.dao.IngredientDao;
import com.mycompany.backend.dao.ProductDao;
import com.mycompany.backend.dao.StockLevelDao;
import com.mycompany.backend.dto.ProductIngredientDto;
import com.mycompany.backend.dto.ProductRequestDto;
import com.mycompany.backend.dto.ProductResponseDto;
import com.mycompany.backend.model.Ingredient;
import com.mycompany.backend.model.Product;
import com.mycompany.backend.model.ProductIngredient;
import com.mycompany.backend.model.StockLevel;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Stateless
public class ProductService {

    @Inject
    private ProductDao productDao;

    @Inject
    private IngredientDao ingredientDao;

    @Inject
    private StockLevelDao stockLevelDao;

    public List<ProductResponseDto> getAllProducts() {
        List<Product> products = productDao.findAll();
        List<ProductResponseDto> dtos = new ArrayList<>();
        for (Product product : products) {
            dtos.add(mapToDto(product));
        }
        return dtos;
    }

    public ProductResponseDto getProductById(Long id) {
        Product product = productDao.findById(id);
        if (product == null) return null;
        return mapToDto(product);
    }

    public ProductResponseDto createProduct(ProductRequestDto dto) {
        Product product = new Product();
        product.setName(dto.getName());
        product.setSellingPrice(dto.getSellingPrice());
        product.setCategory(dto.getCategory());

        List<ProductIngredient> recipe = new ArrayList<>();
        if (dto.getIngredients() != null) {
            for (ProductIngredientDto item : dto.getIngredients()) {
                Ingredient ingredient = ingredientDao.findById(item.getIngredientId());
                if (ingredient != null && item.getQtyPerUnit() != null) {
                    ProductIngredient pi = new ProductIngredient();
                    pi.setProduct(product);
                    pi.setIngredient(ingredient);
                    pi.setQtyPerUnit(item.getQtyPerUnit());
                    recipe.add(pi);
                }
            }
        }
        product.setProductIngredients(recipe);
        productDao.create(product);
        return mapToDto(product);
    }

    public ProductResponseDto updateProduct(Long id, ProductRequestDto dto) {
        Product product = productDao.findById(id);
        if (product == null) return null;

        product.setName(dto.getName());
        product.setSellingPrice(dto.getSellingPrice());
        product.setCategory(dto.getCategory());

        // Replace ingredients
        product.getProductIngredients().clear();
        if (dto.getIngredients() != null) {
            for (ProductIngredientDto item : dto.getIngredients()) {
                Ingredient ingredient = ingredientDao.findById(item.getIngredientId());
                if (ingredient != null && item.getQtyPerUnit() != null) {
                    ProductIngredient pi = new ProductIngredient();
                    pi.setProduct(product);
                    pi.setIngredient(ingredient);
                    pi.setQtyPerUnit(item.getQtyPerUnit());
                    product.getProductIngredients().add(pi);
                }
            }
        }

        productDao.update(product);
        return mapToDto(product);
    }

    public boolean deleteProduct(Long id) {
        Product product = productDao.findById(id);
        if (product != null) {
            productDao.delete(product);
            return true;
        }
        return false;
    }

    /**
     * Converts Product Entity to ProductResponseDto, calculating recipe cost,
     * profit margin, and available portions to sell.
     */
    private ProductResponseDto mapToDto(Product product) {
        ProductResponseDto dto = new ProductResponseDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setSellingPrice(product.getSellingPrice());
        dto.setCategory(product.getCategory());

        BigDecimal totalCost = BigDecimal.ZERO;
        Integer minPortions = null; // Will store the bottleneck ingredient limit

        List<ProductIngredientDto> ingredientDtos = new ArrayList<>();
        if (product.getProductIngredients() != null && !product.getProductIngredients().isEmpty()) {
            for (ProductIngredient pi : product.getProductIngredients()) {
                Ingredient ing = pi.getIngredient();
                BigDecimal lineCost = (ing.getUnitPrice() != null && pi.getQtyPerUnit() != null)
                        ? ing.getUnitPrice().multiply(pi.getQtyPerUnit())
                        : BigDecimal.ZERO;
                totalCost = totalCost.add(lineCost);

                ProductIngredientDto pDto = new ProductIngredientDto(
                        ing.getId(),
                        ing.getName(),
                        ing.getUnit(),
                        ing.getUnitPrice(),
                        pi.getQtyPerUnit()
                );
                pDto.setLineCost(lineCost);
                ingredientDtos.add(pDto);

                // Calculate stock availability: current_qty / qty_per_unit
                StockLevel stockLevel = stockLevelDao.findByIngredientId(ing.getId());
                BigDecimal currentQty = (stockLevel != null && stockLevel.getCurrentQty() != null)
                        ? stockLevel.getCurrentQty()
                        : BigDecimal.ZERO;

                if (pi.getQtyPerUnit() != null && pi.getQtyPerUnit().compareTo(BigDecimal.ZERO) > 0) {
                    int portions = currentQty.divide(pi.getQtyPerUnit(), 0, RoundingMode.FLOOR).intValue();
                    if (portions < 0) portions = 0;
                    if (minPortions == null || portions < minPortions) {
                        minPortions = portions;
                    }
                }
            }
        } else {
            // Product with no ingredients has 0 availability limit
            minPortions = 0;
        }

        dto.setIngredients(ingredientDtos);
        dto.setCostPrice(totalCost.setScale(2, RoundingMode.HALF_UP));
        if (product.getSellingPrice() != null) {
            dto.setProfitMargin(product.getSellingPrice().subtract(totalCost).setScale(2, RoundingMode.HALF_UP));
        }
        dto.setAvailableQty(minPortions != null ? minPortions : 0);

        return dto;
    }
}