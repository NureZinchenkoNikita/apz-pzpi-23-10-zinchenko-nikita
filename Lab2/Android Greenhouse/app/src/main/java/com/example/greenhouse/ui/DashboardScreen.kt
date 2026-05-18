package com.example.greenhouse.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.greenhouse.*
import com.example.greenhouse.network.RetrofitClient
import com.example.greenhouse.utils.SessionManager
import com.example.greenhouse.utils.formatReadableTime
import kotlinx.coroutines.delay
import java.util.Locale

/**
 * ЕКРАН: Головна панель
 */
@Composable
fun DashboardScreen(navController: NavController) {
    var greenhouses by remember { mutableStateOf<List<Greenhouse>>(emptyList()) }
    var readingsMap by remember { mutableStateOf<Map<Int, Reading>>(emptyMap()) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    // фонове оновлення даних у реальному часі
    LaunchedEffect(Unit) {
        while(true) {
            val user = SessionManager.currentUser
            if (user != null) {
                try {
                    val fetchedGreenhouses = RetrofitClient.instance.getGreenhouses(user.id)
                    greenhouses = fetchedGreenhouses

                    val newReadingsMap = mutableMapOf<Int, Reading>()
                    fetchedGreenhouses.forEach { gh ->
                        gh.devices?.forEach { device ->
                            try {
                                val reading = RetrofitClient.instance.getLatestReading(device.id)
                                newReadingsMap[device.id] = reading
                            } catch (e: Exception) { }
                        }
                    }
                    readingsMap = newReadingsMap
                    error = null
                } catch (e: Exception) {
                    error = "Помилка завантаження: ${e.message}"
                } finally {
                    isLoading = false
                }
            }
            delay(5000)
        }
    }

    Column(modifier = Modifier.padding(16.dp)) {
        SessionManager.currentUser?.let { user ->
            Text(
                text = "Користувач: ${user.email}",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.primary,
                modifier = Modifier.align(Alignment.End)
            )
        }

        Text("Моніторинг", style = MaterialTheme.typography.headlineMedium, modifier = Modifier.padding(bottom = 16.dp))

        if (isLoading && greenhouses.isEmpty()) {
            CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally))
        } else if (error != null && greenhouses.isEmpty()) {
            Text(text = error!!, color = MaterialTheme.colorScheme.error)
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(greenhouses) { greenhouse ->
                    GreenhouseCard(greenhouse, readingsMap)
                }
            }
        }
    }
}

/**
 * КОМПОНЕНТ: картка теплиці
 */
@Composable
fun GreenhouseCard(greenhouse: Greenhouse, readingsMap: Map<Int, Reading>) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp).fillMaxWidth()) {

            Text(
                text = greenhouse.name,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )

            val isOwner = SessionManager.currentUser?.id == greenhouse.ownerId
            val roleName = when {
                isOwner -> "Власник"
                greenhouse.userRole == 1 -> "Спеціаліст"
                greenhouse.userRole == 2 -> "Глядач"
                else -> "Доступ надано"
            }

            Text(
                text = "Роль: $roleName",
                style = MaterialTheme.typography.labelMedium,
                color = if (isOwner) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.secondary
            )

            Spacer(modifier = Modifier.height(16.dp))

            if (greenhouse.devices.isNullOrEmpty()) {
                Text(
                    text = "Пристрої відсутні",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            } else {

                greenhouse.devices.forEachIndexed { index, device ->
                    val reading = readingsMap[device.id]

                    DeviceRow(device, reading)

                    if (index < greenhouse.devices.size - 1) {
                        HorizontalDivider(
                            modifier = Modifier.padding(vertical = 8.dp),
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.1f)
                        )
                    }
                }
            }
        }
    }
}

/**
 * КОМПОНЕНТ: рядок пристрою
 */
@Composable
fun DeviceRow(device: DeviceDto, reading: Reading?) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text(text = device.name, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Bold)
            Text(text = device.deviceType ?: "Невідомий тип", style = MaterialTheme.typography.bodySmall)
        }
        Column(horizontalAlignment = Alignment.End) {
            if (reading != null) {
                val formattedValue = String.format(Locale.US, "%.3f", reading.value)

                val readableTime = formatReadableTime(reading.timestamp)

                Text(text = formattedValue, style = MaterialTheme.typography.headlineSmall, color = MaterialTheme.colorScheme.primary)

                Text(text = readableTime, style = MaterialTheme.typography.labelSmall)
            } else {
                Text(text = "--", style = MaterialTheme.typography.headlineSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}