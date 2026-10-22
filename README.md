# EnglishPath C1 — temario de clase (lista para Render)

Proyecto web educativo con Flask, HTML, CSS y JavaScript. La aplicación incluye ejercicios y lecciones basados en los temas legibles del PDF compartido: profesiones eléctricas, cualidades personales, adverbios de frecuencia, gustos y preferencias, ofertas de empleo, oraciones de relativo y presentación laboral.

## Ejecutar en tu ordenador
Necesitas Python 3.10 o superior.

```bash
pip install -r requirements.txt
python app.py
```

Abre `http://127.0.0.1:5000`.

## Publicar en GitHub y desplegar en Render

### 1. Crear el repositorio en GitHub
1. Entra en https://github.com y accede a tu cuenta.
2. Pulsa **New repository**.
3. Ponle `englishpath-c1-temario`.
4. Para seguir esta guía, elige **Public** (o Private si prefieres mantenerlo privado; Render puede conectarse a ambos si autorizas el acceso).
5. Crea el repositorio vacío. Si vas a subir esta carpeta, no marques la opción para añadir README, para evitar conflictos.

### 2. Subir los archivos
La forma más sencilla, sin usar comandos Git:
1. Descomprime el ZIP.
2. En la página del repositorio pulsa **Add file → Upload files**.
3. Arrastra los archivos y carpetas del proyecto descomprimido (incluidos `app.py`, `requirements.txt`, `Procfile`, `render.yaml`, `templates`, `static` y `data`).
4. Pulsa **Commit changes**.

No subas el PDF del libro ni contraseñas/tokens al repositorio.

### 3. Desplegar en Render
1. Entra en https://render.com y crea/inicia sesión en tu cuenta.
2. Elige **New + → Web Service**.
3. Conecta GitHub y autoriza el repositorio `englishpath-c1-temario`.
4. Render detectará Python. Configura:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
   - **Health Check Path:** `/`
5. Si aparece la opción de plan, elige Free para empezar, si está disponible en tu cuenta.
6. Pulsa **Create Web Service** y espera a que termine el despliegue.
7. Abre la URL `https://...onrender.com` que Render muestre en el panel.

El archivo `render.yaml` contiene la configuración de despliegue para que Render pueda leerla como Blueprint, si eliges ese método.

## Si falla el despliegue
- Revisa la pestaña **Logs** en Render.
- Comprueba que `app.py`, `requirements.txt`, `templates/index.html`, `static/` y `data/questions.json` están en la raíz del repositorio con esa estructura.
- Si sale `ModuleNotFoundError: No module named 'gunicorn'`, confirma que `gunicorn` está en `requirements.txt` y vuelve a desplegar.
- Si sale `Application failed to respond`, confirma que el comando de inicio sea exactamente `gunicorn app:app`.

## Importante
No puedo publicar en tus cuentas de GitHub o Render desde este chat porque no tengo una conexión autorizada a esas cuentas. El ZIP está preparado para que tú lo subas y conectes. No compartas tu contraseña conmigo.

## Plan de estudio sugerido
Estudia 45 minutos al día: 10 min teoría, 10 min vocabulario, 10 min ejercicios, 10 min lectura/escucha en voz alta y 5 min de repaso. Usa el temario exacto que marque tu profesor; algunas páginas del PDF son escaneadas y no se pudo extraer todo su contenido.
