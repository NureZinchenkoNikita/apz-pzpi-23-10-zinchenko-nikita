package com.example.greenhouse

import com.google.gson.annotations.SerializedName

data class User(
    val id: Int,
    val email: String,
    val role: String?
)

data class LoginDto(
    val email: String,
    @SerializedName("password")
    val passwordHash: String
)

data class RegisterDto(
    val email: String,
    val password: String
)

data class Reading(
    val id: Int,
    val value: Double,
    val timestamp: String,
    val deviceId: Int
)

data class Device(
    val id: Int,
    val name: String,
    val deviceType: String
)

data class Greenhouse(
    val id: Int,
    val name: String,
    val ownerId: Int,
    val ownerEmail: String?,
    val devices: List<DeviceDto>?,
    val userRole: Int? = null 
)

data class DeviceDto(
    val id: Int,
    val name: String,
    val deviceType: String?
)

data class AlertRule(
    val id: Int = 0,
    val deviceId: Int,
    val condition: String,
    val thresholdValue: Double
)

data class CreateGreenhouseDto(
    val name: String,
    val ownerUserId: Int
)

data class CreateDeviceDto(
    val name: String,
    val deviceType: String,
    val greenhouseId: Int,
    val userId: Int 
)

data class CreateAlertRuleDto(
    val deviceId: Int,
    val condition: String,
    val thresholdValue: Double,
    val userId: Int
)

data class AlertDto(
    val id: Int,
    val timestamp: String,
    val isDismissed: Boolean,
    val deviceName: String,
    val greenhouseName: String,
    val value: Double,
    val message: String
)
