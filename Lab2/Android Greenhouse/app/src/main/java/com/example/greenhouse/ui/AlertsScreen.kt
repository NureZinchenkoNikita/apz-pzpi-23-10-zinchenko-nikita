package com.example.greenhouse.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.greenhouse.AlertDto
import com.example.greenhouse.network.RetrofitClient
import com.example.greenhouse.utils.SessionManager
import com.example.greenhouse.utils.formatReadableTime
import kotlinx.coroutines.delay
import java.util.Locale



/**
 * ЕКРАН: Сповіщення
 * відображає критичні повідромлення коли показники виходять за встановлені межі
 */
@Composable
fun AlertsScreen() {
    var alerts by remember { mutableStateOf<List<AlertDto>>(emptyList()) }
    val context = LocalContext.current

    LaunchedEffect(Unit) {
        while(true) {
            val user = SessionManager.currentUser
            if (user != null) {
                try {
                    alerts = RetrofitClient.instance.getAlerts(user.id)
                } catch (e: Exception) { }
            }
            delay(5000)
        }
    }


    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text(
            text = "Сповіщення",
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        if (alerts.isEmpty()) {
            Text("Активних сповіщень немає")
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(alerts) { alert ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.errorContainer
                        )
                    ) {
                        Column(modifier = Modifier.padding(16.dp).fillMaxWidth()) {

                            Text(
                                text = "Теплиця: ${alert.greenhouseName}",
                                style = MaterialTheme.typography.bodyLarge
                            )
                            Text(
                                text = "Пристрій: ${alert.deviceName}",
                                style = MaterialTheme.typography.bodyLarge,
                                fontWeight = FontWeight.Bold
                            )

                            Spacer(modifier = Modifier.height(4.dp))

                            val formattedValue = String.format(Locale.US, "%.3f", alert.value)
                            Text(
                                text = "Поточне значення: $formattedValue",
                                style = MaterialTheme.typography.bodyMedium
                            )
                            Text(
                                text = "Причина: ${alert.message}",
                                style = MaterialTheme.typography.bodyMedium
                            )

                            Spacer(modifier = Modifier.height(8.dp))


                            Text(
                                text = formatReadableTime(alert.timestamp),
                                style = MaterialTheme.typography.labelMedium,
                                modifier = Modifier.align(Alignment.End)
                            )
                        }
                    }
                }
            }
        }
    }
}
