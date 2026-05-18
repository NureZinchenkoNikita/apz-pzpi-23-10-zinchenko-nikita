package com.example.greenhouse.ui

import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.example.greenhouse.*
import com.example.greenhouse.network.RetrofitClient
import com.example.greenhouse.utils.SessionManager
import kotlinx.coroutines.launch



/**
 * ЕКРАН: Керування теплицями, пристроями та правилами доступу.
 */
@Composable
fun AdminScreen(onLogout: () -> Unit) {
    var tabIndex by remember { mutableStateOf(0) }
    val tabs = listOf("Профіль", "Теплиці", "Правила")

    Column(modifier = Modifier.padding(16.dp)) {
        TabRow(selectedTabIndex = tabIndex) {
            tabs.forEachIndexed { index, title ->
                Tab(selected = tabIndex == index, onClick = { tabIndex = index }, text = { Text(title) })
            }
        }
        when (tabIndex) {
            0 -> ManageSettings(onLogout)
            1 -> ManageGreenhouses()
            2 -> ManageRules()
        }
    }
}

@Composable
fun ManageSettings(onLogout: () -> Unit) {
    val user = SessionManager.currentUser
    Column(modifier = Modifier.padding(top = 16.dp)) {
        Text("Мій профіль", style = MaterialTheme.typography.titleMedium)
        user?.let {
            Text("Email: ${it.email}")
            Text("ID користувача: ${it.id}")
        }
        Button(
            onClick = {
                SessionManager.currentUser = null
                onLogout()
            },
            modifier = Modifier.padding(top = 16.dp)
        ) {
            Text("Вийти з акаунта")
        }
    }
}

/**
 * МЕТОД: Керування теплицями та пристроями
 */
@Composable
fun ManageGreenhouses() {
    var name by remember { mutableStateOf("") }
    var shareWithEmail by remember { mutableStateOf("") }
    var deviceName by remember { mutableStateOf("") }
    var deviceType by remember { mutableStateOf("") }
    var selectedRole by remember { mutableStateOf(2) }

    val user = SessionManager.currentUser ?: return
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    var greenhouses by remember { mutableStateOf<List<Greenhouse>>(emptyList()) }

    LaunchedEffect(Unit) {
        try {
            greenhouses = RetrofitClient.instance.getGreenhouses(user.id)
        } catch (e: Exception) {}
    }

    Column(modifier = Modifier.verticalScroll(rememberScrollState()).padding(top = 16.dp)) {
        Text("Створити нову теплицю", style = MaterialTheme.typography.titleMedium)
        OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("Назва теплиці") },
            modifier = Modifier.fillMaxWidth()
        )
        Button(
            onClick = {
                scope.launch {
                    try {
                        RetrofitClient.instance.createGreenhouse(CreateGreenhouseDto(name, user.id))
                        Toast.makeText(context, "Теплицю створено!", Toast.LENGTH_SHORT).show()
                        name = ""
                        greenhouses = RetrofitClient.instance.getGreenhouses(user.id)
                    } catch (e: Exception) {
                        Toast.makeText(context, "Помилка: ${e.message}", Toast.LENGTH_SHORT).show()
                    }
                }
            },
            modifier = Modifier.padding(vertical = 8.dp)
        ) {
            Text("Створити")
        }

        HorizontalDivider(modifier = Modifier.padding(vertical = 16.dp))

        Text("Додати пристрій", style = MaterialTheme.typography.titleMedium)
        var deviceExpanded by remember { mutableStateOf(false) }
        var selectedGhForDevice by remember { mutableStateOf<Greenhouse?>(null) }

        val writableGreenhouses = greenhouses.filter {
            it.ownerId == user.id || it.userRole == 1
        }

        Box {
            OutlinedButton(onClick = { deviceExpanded = true }, modifier = Modifier.fillMaxWidth()) {
                Text(selectedGhForDevice?.name ?: "Оберіть теплицю")
            }
            DropdownMenu(expanded = deviceExpanded, onDismissRequest = { deviceExpanded = false }) {
                writableGreenhouses.forEach { gh ->
                    DropdownMenuItem(text = { Text(gh.name) }, onClick = { selectedGhForDevice = gh; deviceExpanded = false })
                }
            }
        }

        OutlinedTextField(
            value = deviceName,
            onValueChange = { deviceName = it },
            label = { Text("Назва пристрою") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = deviceType,
            onValueChange = { deviceType = it },
            label = { Text("Тип (напр. Датчик вологості)") },
            modifier = Modifier.fillMaxWidth()
        )

        Button(
            onClick = {
                if (selectedGhForDevice != null && deviceName.isNotEmpty() && deviceType.isNotEmpty()) {
                    scope.launch {
                        try {
                            val dto = CreateDeviceDto(deviceName, deviceType, selectedGhForDevice!!.id, user.id)
                            RetrofitClient.instance.createDevice(dto, user.id)
                            Toast.makeText(context, "Пристрій додано!", Toast.LENGTH_SHORT).show()
                            deviceName = ""
                            deviceType = ""
                        } catch (e: Exception) {
                            Toast.makeText(context, "Помилка доступу або мережі", Toast.LENGTH_SHORT).show()
                        }
                    }
                }
            },
            enabled = selectedGhForDevice != null,
            modifier = Modifier.padding(vertical = 8.dp)
        ) {
            Text("Додати пристрій")
        }

        HorizontalDivider(modifier = Modifier.padding(vertical = 16.dp))

        Text("Надати доступ (Тільки власник)", style = MaterialTheme.typography.titleMedium)
        var selectedGh by remember { mutableStateOf<Greenhouse?>(null) }
        var expanded by remember { mutableStateOf(false) }

        val ownedGreenhouses = greenhouses.filter { it.ownerId == user.id }

        Box {
            OutlinedButton(onClick = { expanded = true }, modifier = Modifier.fillMaxWidth()) {
                Text(selectedGh?.name ?: "Оберіть теплицю")
            }
            DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                ownedGreenhouses.forEach { gh ->
                    DropdownMenuItem(text = { Text(gh.name) }, onClick = { selectedGh = gh; expanded = false })
                }
            }
        }

        OutlinedTextField(
            value = shareWithEmail,
            onValueChange = { shareWithEmail = it },
            label = { Text("Email користувача") },
            modifier = Modifier.fillMaxWidth()
        )

        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("Роль: ")
            RadioButton(selected = selectedRole == 1, onClick = { selectedRole = 1 })
            Text("Спеціаліст")
            Spacer(modifier = Modifier.width(8.dp))
            RadioButton(selected = selectedRole == 2, onClick = { selectedRole = 2 })
            Text("Глядач")
        }

        Button(
            onClick = {
                if (selectedGh != null && shareWithEmail.isNotEmpty()) {
                    scope.launch {
                        try {
                            RetrofitClient.instance.grantAccess(selectedGh!!.id, shareWithEmail, selectedRole, user.id)
                            Toast.makeText(context, "Доступ надано!", Toast.LENGTH_SHORT).show()
                            shareWithEmail = ""
                        } catch (e: Exception) {
                            Toast.makeText(context, "Помилка: ${e.message}", Toast.LENGTH_SHORT).show()
                        }
                    }
                }
            },
            enabled = selectedGh != null,
            modifier = Modifier.padding(vertical = 8.dp)
        ) {
            Text("Надати доступ")
        }
    }
}

/**
 * МЕТОД: Керування правилами сповіщень
 * дозволяє створювати умови за яких система надішле попередження
 */
@Composable
fun ManageRules() {
    var rules by remember { mutableStateOf<List<AlertRule>>(emptyList()) }
    var devices by remember { mutableStateOf<List<DeviceDto>>(emptyList()) }
    var showDialog by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    val user = SessionManager.currentUser ?: return

    fun loadRules() {
        scope.launch {
            try {
                rules = RetrofitClient.instance.getAlertRules(user.id)
                val ghs = RetrofitClient.instance.getGreenhouses(user.id)
                val writableGhs = ghs.filter { it.ownerId == user.id || it.userRole == 1 }
                devices = writableGhs.flatMap { it.devices ?: emptyList() }
            } catch (e: Exception) {}
        }
    }

    LaunchedEffect(Unit) { loadRules() }

    Column(modifier = Modifier.padding(top = 16.dp)) {
        Button(onClick = { showDialog = true }) { Text("Додати правило") }

        LazyColumn(modifier = Modifier.padding(top = 8.dp)) {
            items(rules) { rule ->
                ListItem(
                    headlineContent = { Text("Пристрій ID: ${rule.deviceId}") },
                    supportingContent = { Text("Умова: ${rule.condition} ${rule.thresholdValue}") },
                    trailingContent = {
                        IconButton(onClick = {
                            scope.launch {
                                try {
                                    RetrofitClient.instance.deleteAlertRule(rule.id, user.id)
                                    loadRules()
                                } catch (e: Exception) {
                                    Toast.makeText(context, "Помилка видалення", Toast.LENGTH_SHORT).show()
                                }
                            }
                        }) {
                            Icon(Icons.Default.Delete, "Видалити")
                        }
                    }
                )
                Divider()
            }
        }
    }

    if (showDialog) {
        AddRuleDialog(devices, { showDialog = false }, { loadRules() }, user.id)
    }
}

@Composable
fun AddRuleDialog(devices: List<DeviceDto>, onDismiss: () -> Unit, onRuleAdded: () -> Unit, userId: Int) {
    var selectedDevice by remember { mutableStateOf<DeviceDto?>(null) }
    var condition by remember { mutableStateOf("GreaterThan") }
    var threshold by remember { mutableStateOf("") }
    var expanded by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Нове правило сповіщення") },
        text = {
            Column {
                Box {
                    OutlinedButton(onClick = { expanded = true }, modifier = Modifier.fillMaxWidth()) {
                        Text(selectedDevice?.name ?: "Оберіть пристрій")
                    }
                    DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                        devices.forEach { device ->
                            DropdownMenuItem(
                                text = { Text(device.name) },
                                onClick = { selectedDevice = device; expanded = false }
                            )
                        }
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
                Row {
                    RadioButton(selected = condition == "GreaterThan", onClick = { condition = "GreaterThan" })
                    Text("Більше ніж", modifier = Modifier.align(Alignment.CenterVertically))
                }
                Row {
                    RadioButton(selected = condition == "LessThan", onClick = { condition = "LessThan" })
                    Text("Менше ніж", modifier = Modifier.align(Alignment.CenterVertically))
                }
                OutlinedTextField(
                    value = threshold,
                    onValueChange = { threshold = it },
                    label = { Text("Порогове значення") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (selectedDevice != null && threshold.isNotEmpty()) {
                        scope.launch {
                            try {
                                val dto = CreateAlertRuleDto(selectedDevice!!.id, condition, threshold.toDouble(), userId)
                                RetrofitClient.instance.createAlertRule(dto, userId)
                                onRuleAdded()
                                onDismiss()
                            } catch (e: Exception) {
                                Toast.makeText(context, "Помилка додавання", Toast.LENGTH_SHORT).show()
                            }
                        }
                    }
                }
            ) { Text("Додати") }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Скасувати") }
        }
    )
}
