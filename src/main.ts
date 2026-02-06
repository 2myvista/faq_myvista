// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// Создание приложения
const app = createApp(App)

// Подключение Pinia
const pinia = createPinia()
app.use(pinia)

// Монтирование приложения
app.mount('#app')

// Отладка
console.log('Vue приложение запущено')