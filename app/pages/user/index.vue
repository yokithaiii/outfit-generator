<script setup lang="ts">
import { onMounted } from 'vue'

function onTelegramAuth(user: any) {
    fetch('/api/auth/telegram', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
    })
        .then(async res => {
            const data = await res.json()
            console.log('Авторизация через Telegram:', data)

            if (data.token) {
                localStorage.setItem('auth_token', data.token)
            }
        })
        .catch(console.error)
}

onMounted(() => {
    if (document.getElementById('telegram-login-script')) {
        return
    }

    const script = document.createElement('script')
    script.id = 'telegram-login-script'
    script.async = true
    script.src = 'https://telegram.org/js/telegram-widget.js?22'

    script.setAttribute('data-telegram-login', 'outfit_generator_auth_bot')
    script.setAttribute('data-size', 'medium')
    script.setAttribute('data-radius', '4')
    script.setAttribute('data-request-access', 'write')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')

    document.getElementById('telegram-login-container')?.appendChild(script)

    // Делаем обработчик глобальным (Telegram вызывает window.onTelegramAuth)
    // @ts-ignore
    window.onTelegramAuth = onTelegramAuth
})
</script>

<template>
    <div id="telegram-login-container"></div>
</template>

<style scoped>
#telegram-login-container {
    display: flex;
    justify-content: center;
}
</style>
