package com.mycompany.backend.resources;

import com.mycompany.backend.dto.ProductRequestDto;
import com.mycompany.backend.dto.ProductResponseDto;
import com.mycompany.backend.service.ProductService;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProductResource {

    @Inject
    private ProductService productService;

    @GET
    public Response getAllProducts() {
        List<ProductResponseDto> products = productService.getAllProducts();
        return Response.ok(products).build();
    }

    @GET
    @Path("/{id}")
    public Response getProductById(@PathParam("id") Long id) {
        ProductResponseDto product = productService.getProductById(id);
        if (product == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Product not found with id: " + id)
                    .build();
        }
        return Response.ok(product).build();
    }

    @POST
    public Response createProduct(ProductRequestDto dto) {
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Product name is required")
                    .build();
        }
        ProductResponseDto created = productService.createProduct(dto);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @PUT
    @Path("/{id}")
    public Response updateProduct(@PathParam("id") Long id, ProductRequestDto dto) {
        ProductResponseDto updated = productService.updateProduct(id, dto);
        if (updated == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Product not found with id: " + id)
                    .build();
        }
        return Response.ok(updated).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deleteProduct(@PathParam("id") Long id) {
        boolean deleted = productService.deleteProduct(id);
        if (!deleted) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Product not found with id: " + id)
                    .build();
        }
        return Response.noContent().build();
    }
}