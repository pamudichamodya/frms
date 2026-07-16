package com.mycompany.backend.resources;

import com.mycompany.backend.dto.WasteRequestDto;
import com.mycompany.backend.dto.WasteResponseDto;
import com.mycompany.backend.service.WasteService;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/waste")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class WasteResource {

    @Inject
    private WasteService wasteService;

    @GET
    public Response getAllWasteEvents() {
        List<WasteResponseDto> events = wasteService.getAllWasteEvents();
        return Response.ok(events).build();
    }

    // Append-only implementation: No @PUT or @DELETE mappings exist.
    @POST
    public Response recordWaste(WasteRequestDto dto) {
        WasteResponseDto recorded = wasteService.recordWaste(dto);
        return Response.status(Response.Status.CREATED).entity(recorded).build();
    }
}