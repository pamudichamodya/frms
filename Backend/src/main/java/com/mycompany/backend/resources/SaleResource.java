package com.mycompany.backend.resources;

import com.mycompany.backend.dto.SaleRequestDto;
import com.mycompany.backend.dto.SaleResponseDto;
import com.mycompany.backend.service.SaleService;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/sales")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SaleResource {

    @Inject
    private SaleService saleService;

    @GET
    public Response getAllSales() {
        List<SaleResponseDto> sales = saleService.getAllSales();
        return Response.ok(sales).build();
    }

    @POST
    public Response processSale(SaleRequestDto dto) {
        SaleResponseDto created = saleService.processSale(dto);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }
}