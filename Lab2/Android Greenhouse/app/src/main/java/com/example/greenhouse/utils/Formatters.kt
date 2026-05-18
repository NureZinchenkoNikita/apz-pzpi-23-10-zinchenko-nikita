package com.example.greenhouse.utils

import java.text.SimpleDateFormat
import java.util.Locale


fun formatReadableTime(rawTimestamp: String): String {
    return try {
        //відрізаємо мілісекунди
        val cleanTimestamp = rawTimestamp.substringBefore(".")

        //як виглядає час із сервера
        val parser = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())

        //як ми хочемо його бачити
        val formatter = SimpleDateFormat("dd.MM.yyyy HH:mm", Locale.getDefault())

        val parsedDate = parser.parse(cleanTimestamp)
        if (parsedDate != null) formatter.format(parsedDate) else rawTimestamp
    } catch (e: Exception) {
        rawTimestamp //повернення якщо помилка
    }
}
