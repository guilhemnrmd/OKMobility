# Nota Técnica — Funcionalidad Espejo y Garantías de Privacidad

**Fecha:** 25 de marzo de 2026
**Producto:** OK Mobility — Captura de datos del cliente
**Destinatario:** [Empresa solicitante]

---

## ¿Cómo funciona el espejo?

La funcionalidad "espejo" permite que los datos introducidos por el cliente en su pantalla (dirección, teléfono, correo) aparezcan en tiempo real en la pantalla del asesor, sin que el cliente dicte ni el asesor teclee.

La conexión se establece mediante **WebRTC** (estándar W3C), una tecnología de comunicación directa entre navegadores. El flujo es el siguiente:

1. El asesor abre su pantalla → se genera un código de sesión único (QR o 6 dígitos)
2. El cliente escanea el código → se establece un canal directo entre los dos dispositivos
3. Los datos fluyen en tiempo real del cliente al asesor, por ese canal directo
4. Al cerrar la sesión → el canal se destruye y los datos desaparecen

---

## ¿Cómo se garantiza que los datos no quedan almacenados?

### Los datos nunca pasan por ningún servidor de OK Mobility

El canal WebRTC es **punto a punto** (P2P): los datos viajan directamente del navegador del cliente al navegador del asesor. Los servidores de OK Mobility no son intermediarios en este flujo y, por tanto, no pueden registrar ni almacenar el contenido.

Los únicos servidores que intervienen son auxiliares de conexión (STUN/TURN de Cloudflare y Google), cuya función es exclusivamente establecer el canal. En ningún caso reciben ni pueden leer los datos del formulario.

### El canal está cifrado de extremo a extremo

WebRTC cifra el canal de manera obligatoria mediante **DTLS + SRTP**, los mismos protocolos utilizados en comunicaciones seguras estándar. Esto significa que:
- Los datos son ilegibles para cualquier intermediario
- OK Mobility no posee ninguna clave de descifrado
- No existe ninguna ruta técnica para acceder al contenido en tránsito

### Los datos solo existen en memoria RAM

En ninguno de los dos dispositivos se produce escritura a disco. Los datos del cliente:
- **No se guardan** en base de datos, fichero, log ni caché de servidor
- **Viven únicamente en la memoria RAM** del navegador del asesor mientras la sesión está activa
- **Desaparecen definitivamente** al cerrar la pestaña del navegador

---

## Resumen

| Elemento | ¿Se almacena? |
|---|---|
| Datos del cliente (dirección, teléfono, email) | **No** — ni en servidor, ni en disco |
| Canal de transmisión | **Cifrado E2E** — ilegible para terceros |
| Persistencia tras la sesión | **Ninguna** — borrado automático al cerrar |

---

*Análisis elaborado sobre la base del código fuente del producto. Verificable en: `assets/js/script.js`, `assets/js/conseiller.js`, `functions/api/turn-credentials.js`.*
