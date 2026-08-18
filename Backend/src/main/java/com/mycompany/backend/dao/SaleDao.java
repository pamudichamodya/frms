package com.mycompany.backend.dao;

import com.mycompany.backend.model.Sale;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class SaleDao extends GenericDao<Sale, Long> {

    public SaleDao() {
        super(Sale.class);
    }

    // JOIN FETCH so product + user are pulled in this one query instead of
    // triggering a separate lazy load per row when the resource layer maps
    // each Sale to a SaleResponseDto.
    public List<Sale> findAllOrderByTimestampDesc() {
        return em.createQuery(
                "SELECT s FROM Sale s JOIN FETCH s.product JOIN FETCH s.user ORDER BY s.timestamp DESC",
                Sale.class)
                .getResultList();
    }
}