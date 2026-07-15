package com.mycompany.backend.dao;

import com.mycompany.backend.model.Product;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ProductDao extends GenericDao<Product, Long> {

    public ProductDao() {
        super(Product.class);
    }
}