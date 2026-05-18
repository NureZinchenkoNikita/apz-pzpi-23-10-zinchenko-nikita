package com.example.greenhouse

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.greenhouse.ui.theme.GreenhouseTheme
import com.example.greenhouse.ui.DashboardScreen
import com.example.greenhouse.ui.HistoryScreen
import com.example.greenhouse.ui.AlertsScreen
import com.example.greenhouse.ui.AdminScreen
import com.example.greenhouse.ui.LoginScreen
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Icon
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Warning
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.compose.runtime.getValue
import androidx.compose.ui.unit.sp
import androidx.navigation.compose.currentBackStackEntryAsState

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            GreenhouseTheme {
                MainApp()
            }
        }
    }
}

sealed class Screen(val route: String, val title: String, val icon: androidx.compose.ui.graphics.vector.ImageVector) {
    object Login : Screen("login", "Login", Icons.Filled.Home) // Icon not used for login
    object Dashboard : Screen("dashboard", "Моніторинг", Icons.Filled.Home)
    object History : Screen("history", "Історія", Icons.Filled.List)
    object Alerts : Screen("alerts", "Сповіщення", Icons.Filled.Warning)
    object Admin : Screen("admin", "Налаштування", Icons.Filled.Settings)
}

@Composable
fun MainApp() {
    val navController = rememberNavController()
    val bottomNavItems = listOf(
        Screen.Dashboard,
        Screen.History,
        Screen.Alerts,
        Screen.Admin
    )

    Scaffold(
        bottomBar = {
            val navBackStackEntry by navController.currentBackStackEntryAsState()
            val currentDestination = navBackStackEntry?.destination
            // Hide bottom bar on Login screen
            if (currentDestination?.route != Screen.Login.route) {
                NavigationBar {
                    bottomNavItems.forEach { screen ->
                        NavigationBarItem(
                            icon = { Icon(screen.icon, contentDescription = null) },
                            label = { Text(screen.title, fontSize = 10.sp, maxLines = 1) }, // Reduced font size and set maxLines
                            selected = currentDestination?.hierarchy?.any { it.route == screen.route } == true,
                            onClick = {
                                navController.navigate(screen.route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Login.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Login.route) { 
                LoginScreen(onLoginSuccess = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                })
            }
            composable(Screen.Dashboard.route) { DashboardScreen(navController) }
            composable(Screen.History.route) { HistoryScreen(navController) }
            composable(Screen.Alerts.route) { AlertsScreen() }
            composable(Screen.Admin.route) { 
                AdminScreen(onLogout = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) // Clear back stack
                    }
                }) 
            }
        }
    }
}
