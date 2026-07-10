package com.mycompany.backend;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * INTEGRATION TEST: Tests concurrent safety of the Inventory Deduction Logic.
 * 
 * Instructions:
 * 1. Ensure GlassFish server is running and deployed locally on port 8080.
 * 2. Ensure Product ID 3 ("Chicken Rice") and User ID 5 ("Udara") exist.
 * 3. Run this class via your IDE (Run File).
 */
public class SaleConcurrencyIT {

    // Number of simultaneous requests we will throw at the server
    private static final int THREAD_COUNT = 20;

    public static void main(String[] args) throws InterruptedException {
        System.out.println("Starting Concurrency Integration Test...");

        ExecutorService executor = Executors.newFixedFixedThreadPool(THREAD_COUNT);
        CountDownLatch latch = new CountDownLatch(1); // To hold threads until ready
        CountDownLatch completionLatch = new CountDownLatch(THREAD_COUNT);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount = new AtomicInteger(0);

        // We simulate 20 requests hitting the exact same endpoint at once
        for (int i = 0; i < THREAD_COUNT; i++) {
            executor.submit(() -> {
                try {
                    // Wait for the latch to drop so all threads fire simultaneously
                    latch.await();

                    // JSON Payload: Sell 1 quantity of Product ID 3 using User ID 5
                    String jsonPayload = "{\"productId\": 3, \"qtySold\": 1.00, \"userId\": 5}";

                    HttpClient client = HttpClient.newHttpClient();
                    HttpRequest request = HttpRequest.newBuilder()
                            .uri(URI.create("http://localhost:8080/Backend/api/sales"))
                            .header("Content-Type", "application/json")
                            .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                            .build();

                    HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

                    // Status 201 = Created (Sale passed)
                    // Status 400 = Bad Request (Sale failed due to insufficient stock validation)
                    if (response.statusCode() == 201) {
                        successCount.incrementAndGet();
                    } else {
                        failCount.incrementAndGet();
                    }

                } catch (Exception e) {
                    failCount.incrementAndGet();
                } finally {
                    completionLatch.countDown();
                }
            });
        }

        System.out.println("All threads loaded. Firing requests simultaneously...");
        latch.countDown(); // Unleash all 20 threads simultaneously

        // Wait for all HTTP requests to finish
        completionLatch.await();
        executor.shutdown();

        System.out.println("---- TEST RESULTS ----");
        System.out.println("Total Requests Fired: " + THREAD_COUNT);
        System.out.println("Successful Sales: " + successCount.get());
        System.out.println("Failed/Blocked Sales: " + failCount.get());
        
        System.out.println("\nIf your stock level started at exactly 9 portions (as per DB dump),");
        System.out.println("Successful Sales should exactly equal 9, and Failed should equal 11.");
        System.out.println("If true, your concurrency locks and DB triggers are functioning perfectly!");
    }
}