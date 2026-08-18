package com.mycompany.backend.resources;

import com.mycompany.backend.dto.LoginRequestDto;
import com.mycompany.backend.dto.LoginResponseDto;
import com.mycompany.backend.dto.UserRegisterDto;
import com.mycompany.backend.dto.UserResponseDto;
import com.mycompany.backend.enums.Role;
import com.mycompany.backend.model.User;
import com.mycompany.backend.service.AuthService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    private AuthService authService;

    @POST
    @Path("/login")
    public Response login(LoginRequestDto request) {
        try {
            LoginResponseDto response = authService.authenticate(request);
            return Response.ok(response).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"" + e.getMessage() + "\"}")
                    .build();
        }
    }

    @POST
    @Path("/register")
    public Response register(UserRegisterDto dto) {
        try {
            UserResponseDto createdUser = authService.registerUser(dto);

            return Response.status(Response.Status.CREATED)
                    .entity(createdUser)
                    .build();

        } catch (IllegalArgumentException e) {

            return Response.status(Response.Status.CONFLICT)
                    .entity("{\"error\":\"" + e.getMessage() + "\"}")
                    .build();
        }
    }
}
