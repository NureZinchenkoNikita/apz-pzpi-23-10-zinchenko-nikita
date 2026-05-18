package com.example.greenhouse.utils

import com.example.greenhouse.User

/**
 * Зберігає дані про поточного авторизованого користувача
 */
object SessionManager {
    var currentUser: User? = null
}