package com.mycompany.backend.service;

import com.mycompany.backend.dao.IngredientDao;
import com.mycompany.backend.dao.UserDao;
import com.mycompany.backend.dao.WasteEventDao;
import com.mycompany.backend.dto.WasteRequestDto;
import com.mycompany.backend.dto.WasteResponseDto;
import com.mycompany.backend.enums.WasteCategory;
import com.mycompany.backend.model.Ingredient;
import com.mycompany.backend.model.User;
import com.mycompany.backend.model.WasteEvent;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Stateless
public class WasteService {

    @Inject
    private WasteEventDao wasteEventDao;

    @Inject
    private IngredientDao ingredientDao;

    @Inject
    private UserDao userDao;

    public List<WasteResponseDto> getAllWasteEvents() {
        List<WasteEvent> events = wasteEventDao.findAll();
        List<WasteResponseDto> dtos = new ArrayList<>();
        for (WasteEvent event : events) {
            dtos.add(mapToDto(event));
        }
        return dtos;
    }

    public WasteResponseDto recordWaste(WasteRequestDto dto) {
        Ingredient ingredient = ingredientDao.findById(dto.getIngredientId());
        if (ingredient == null) {
            throw new WebApplicationException("Ingredient not found", Response.Status.NOT_FOUND);
        }

        User user = userDao.findById(dto.getUserId());
        if (user == null) {
            throw new WebApplicationException("User not found", Response.Status.NOT_FOUND);
        }

        WasteEvent event = new WasteEvent();
        event.setIngredient(ingredient);
        event.setQtyWasted(dto.getQtyWasted());
        
        try {
            event.setWasteCategory(WasteCategory.valueOf(dto.getWasteCategory().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new WebApplicationException("Invalid waste category", Response.Status.BAD_REQUEST);
        }
        
        event.setReason(dto.getReason());
        event.setUser(user);
        event.setTimestamp(LocalDateTime.now());

        // Note: The trg_waste_events_after_insert trigger automatically updates stock
        wasteEventDao.create(event);

        return mapToDto(event);
    }

    private WasteResponseDto mapToDto(WasteEvent event) {
        WasteResponseDto dto = new WasteResponseDto();
        dto.setId(event.getId());
        dto.setIngredientName(event.getIngredient().getName());
        dto.setQtyWasted(event.getQtyWasted());
        dto.setWasteCategory(event.getWasteCategory().name());
        dto.setReason(event.getReason());
        dto.setTimestamp(event.getTimestamp());
        dto.setUserName(event.getUser().getName());
        return dto;
    }
}