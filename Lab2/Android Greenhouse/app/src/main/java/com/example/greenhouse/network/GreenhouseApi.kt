package com.example.greenhouse.network

import com.example.greenhouse.AlertDto
import com.example.greenhouse.AlertRule
import com.example.greenhouse.CreateAlertRuleDto
import com.example.greenhouse.CreateDeviceDto
import com.example.greenhouse.CreateGreenhouseDto
import com.example.greenhouse.Device
import com.example.greenhouse.Greenhouse
import com.example.greenhouse.Reading
import com.example.greenhouse.RegisterDto
import com.example.greenhouse.User
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface GreenhouseApi {
    @POST("api/auth/register")
    suspend fun register(@Body registerDto: RegisterDto): User

    @POST("api/auth/login")
    suspend fun login(@Body loginDto: RegisterDto): User

    @GET("api/greenhouses")
    suspend fun getGreenhouses(@Query("userId") userId: Int): List<Greenhouse>

    @POST("api/greenhouses")
    suspend fun createGreenhouse(@Body greenhouse: CreateGreenhouseDto): Greenhouse

    @POST("api/greenhouses/grant-access")
    suspend fun grantAccess(
        @Query("greenhouseId") greenhouseId: Int,
        @Query("targetEmail") targetEmail: String,
        @Query("role") role: Int,
        @Query("currentUserId") currentUserId: Int
    ): Response<Void>

    @POST("api/devices")
    suspend fun createDevice(@Body device: CreateDeviceDto, @Query("userId") userId: Int): Device

    @GET("api/devices/{id}/latest-reading")
    suspend fun getLatestReading(@Path("id") deviceId: Int): Reading

    @GET("api/devices/{id}/readings/history")
    suspend fun getReadingHistory(
        @Path("id") deviceId: Int,
        @Query("startTime") startTime: String,
        @Query("endTime") endTime: String
    ): List<Reading>

    @GET("api/alertrules")
    suspend fun getAlertRules(@Query("userId") userId: Int): List<AlertRule>

    @POST("api/alertrules")
    suspend fun createAlertRule(@Body rule: CreateAlertRuleDto, @Query("userId") userId: Int): AlertRule

    @DELETE("api/alertrules/{id}")
    suspend fun deleteAlertRule(@Path("id") id: Int, @Query("userId") userId: Int): Response<Void>

    @GET("api/alerts")
    suspend fun getAlerts(@Query("userId") userId: Int): List<AlertDto>
}