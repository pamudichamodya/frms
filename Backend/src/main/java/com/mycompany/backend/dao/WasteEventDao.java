package com.mycompany.backend.dao;

import com.mycompany.backend.model.WasteEvent;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class WasteEventDao extends GenericDao<WasteEvent, Long> {

    public WasteEventDao() {
        super(WasteEvent.class);
    }
}