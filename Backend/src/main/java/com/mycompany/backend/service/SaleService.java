package com.mycompany.backend.service;

import com.mycompany.backend.dao.ProductDao;
import com.mycompany.backend.dao.SaleDao;
import com.mycompany.backend.dao.StockLevelDao;
import com.mycompany.backend.dao.UserDao;
import com.mycompany.backend.dto.SaleRequestDto;
import com.mycompany.backend.dto.SaleResponseDto;
import com.mycompany.backend.model.Product;
import com.mycompany.backend.model.ProductIngredient;
import com.mycompany.backend.model.Sale;
import com.mycompany.backend.model.StockLevel;
import com.mycompany.backend.model.User;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Stateless
public class SaleService {

    @Inject
    private SaleDao saleDao;

    @Inject
    private ProductDao productDao;

    @Inject
    private UserDao userDao;

    @Inject
    private StockLevelDao stockLevelDao;

    public List<SaleResponseDto> getAllSales() {
        List<Sale> sales = saleDao.findAll();
        List<SaleResponseDto> dtos = new ArrayList<>();
        for (Sale sale : sales) {
            dtos.add(mapToDto(sale));
        }
        return dtos;
    }

    public SaleResponseDto processSale(SaleRequestDto dto) {
        Product product = productDao.findById(dto.getProductId());
        if (product == null) {
            throw new WebApplicationException("Product not found", Response.Status.NOT_FOUND);
        }

        User user = userDao.findById(dto.getUserId());
        if (user == null) {
            throw new WebApplicationException("User not found", Response.Status.NOT_FOUND);
        }

        BigDecimal qtySoldDecimal = dto.getQtySold();

        // Validate stock availability. Lock each ingredient's stock row
        // (PESSIMISTIC_WRITE) here — without it, two concurrent sales for
        // the same ingredient can both read sufficient stock, both pass
        // validation, and both insert, driving current_qty negative.
        if (product.getProductIngredients() != null && !product.getProductIngredients().isEmpty()) {
            for (ProductIngredient pi : product.getProductIngredients()) {
                BigDecimal requiredQty = pi.getQtyPerUnit().multiply(qtySoldDecimal);
                StockLevel stockLevel = stockLevelDao.findByIngredientIdWithLock(pi.getIngredient().getId());
                
                BigDecimal currentQty = (stockLevel != null && stockLevel.getCurrentQty() != null) 
                        ? stockLevel.getCurrentQty() 
                        : BigDecimal.ZERO;

                if (currentQty.compareTo(requiredQty) < 0) {
                    throw new WebApplicationException(
                        "Insufficient stock to sell this product. Missing: " + pi.getIngredient().getName(), 
                        Response.Status.BAD_REQUEST
                    );
                }
            }
        }

        Sale sale = new Sale();
        sale.setProduct(product);
        sale.setQtySold(qtySoldDecimal);
        
        // Calculate total sale price
        BigDecimal salePrice = product.getSellingPrice().multiply(qtySoldDecimal);
        sale.setSalePrice(salePrice);
        
        sale.setUser(user);
        sale.setTimestamp(LocalDateTime.now());

        saleDao.create(sale);

        return mapToDto(sale);
    }

    private SaleResponseDto mapToDto(Sale sale) {
        SaleResponseDto dto = new SaleResponseDto();
        dto.setId(sale.getId());
        dto.setProductId(sale.getProduct().getId());
        dto.setProductName(sale.getProduct().getName());
        dto.setQtySold(sale.getQtySold());
        dto.setSalePrice(sale.getSalePrice());
        dto.setTimestamp(sale.getTimestamp());
        dto.setUserId(sale.getUser().getId());
        dto.setUserName(sale.getUser().getName());
        return dto;
    }
}