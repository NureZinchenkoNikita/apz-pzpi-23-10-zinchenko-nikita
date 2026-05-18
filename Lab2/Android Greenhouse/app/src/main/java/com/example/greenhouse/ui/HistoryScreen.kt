package com.example.greenhouse.ui

import android.content.Intent
import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.greenhouse.*
import com.example.greenhouse.network.RetrofitClient
import com.example.greenhouse.utils.SessionManager
import com.example.greenhouse.utils.formatReadableTime
import kotlinx.coroutines.delay
import java.util.Locale



/**
 * ЕКРАН: Історія експорт даних у форматі CSV
 */
@Composable
fun HistoryScreen(navController: NavController) {
    var greenhouses by remember { mutableStateOf<List<Greenhouse>>(emptyList()) }
    var selectedDevice by remember { mutableStateOf<DeviceDto?>(null) }

    var startDate by remember { mutableStateOf("2020-01-01T00:00:00") }
    var endDate by remember { mutableStateOf("2030-12-31T23:59:59") }

    var history by remember { mutableStateOf<List<Reading>>(emptyList()) }
    var errorMessage by remember { mutableStateOf<String?>(null) } // Для відображення помилок

    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    // Завантаження списку теплиць
    LaunchedEffect(Unit) {
        val user = SessionManager.currentUser
        if (user != null) {
            try {
                greenhouses = RetrofitClient.instance.getGreenhouses(user.id)
            } catch (e: Exception) {
                Toast.makeText(context, "Помилка завантаження списку", Toast.LENGTH_SHORT).show()
            }
        }
    }

    // фонове оновлення історії обраного пристрою
    LaunchedEffect(selectedDevice) {
        while(selectedDevice != null) {
            try {
                history = RetrofitClient.instance.getReadingHistory(
                    selectedDevice!!.id, startDate, endDate
                )
                errorMessage = null
            } catch (e: Exception) {
                e.printStackTrace()
                errorMessage = "Помилка мережі або сервера: ${e.message}"
            }
            delay(5000)
        }
    }

    Column(modifier = Modifier.padding(16.dp).fillMaxSize()) {
        Text("Історія", style = MaterialTheme.typography.headlineMedium)

        var expanded by remember { mutableStateOf(false) }
        Box(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
            OutlinedButton(onClick = { expanded = !expanded }, modifier = Modifier.fillMaxWidth()) {
                Text(selectedDevice?.name ?: "Оберіть пристрій")
            }
            DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                greenhouses.forEach { gh ->
                    gh.devices?.forEach { device ->
                        DropdownMenuItem(
                            text = { Text("${gh.name} - ${device.name}") },
                            onClick = {
                                selectedDevice = device
                                expanded = false

                            }
                        )
                    }
                }
            }
        }

        if (selectedDevice != null) {
            Button(
                onClick = {
                    if (history.isNotEmpty()) {
                        val csv = "ID,Value,Timestamp\n" + history.joinToString("\n") {
                            "${it.id},${String.format(Locale.US, "%.3f", it.value)},${it.timestamp}"
                        }
                        val sendIntent: Intent = Intent().apply {
                            action = Intent.ACTION_SEND
                            putExtra(Intent.EXTRA_TEXT, csv)
                            type = "text/plain"
                        }
                        val shareIntent = Intent.createChooser(sendIntent, "Експорт CSV")
                        context.startActivity(shareIntent)
                    } else {
                        Toast.makeText(context, "Немає даних для експорту", Toast.LENGTH_SHORT).show()
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = history.isNotEmpty()
            ) {
                Icon(Icons.Default.Share, "Export CSV")
                Spacer(Modifier.width(8.dp))
                Text("Експортувати у CSV")
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        if (errorMessage != null) {
            Text(text = errorMessage!!, color = MaterialTheme.colorScheme.error)
        } else if (selectedDevice != null && history.isEmpty()) {
            Text(
                text = "Немає записів для цього пристрою",
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.align(Alignment.CenterHorizontally).padding(top = 16.dp)
            )
        } else {
            LazyColumn(modifier = Modifier.fillMaxSize()) {
                items(history) { reading ->
                    val formattedValue = String.format(Locale.US, "%.3f", reading.value)
                    val readableTime = formatReadableTime(reading.timestamp)

                    Text(
                        text = "Значення: $formattedValue | Час: $readableTime",
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                    Divider()
                }
            }
        }
    }
}