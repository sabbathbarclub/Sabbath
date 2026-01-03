# SABBATH BACKEND API
### *Arquitectura de Servicios y Gestión de Datos*

---

## 1. Resumen Técnico

El subsistema **Sabbath Backend** constituye el núcleo lógico de la plataforma. Construido sobre **Django** y **Django REST Framework (DRF)**, este servicio provee endpoints seguros, gestión de usuarios, y orquestación de datos para las aplicaciones cliente. Se prioriza la seguridad, la integridad de datos y la extensibilidad.

## 2. Pila Tecnológica (Tech Stack)

*   **Framework Principal**: Django 4.2+
*   **API Toolkit**: Django REST Framework
*   **Base de Datos**: SQLite (Dev) / PostgreSQL (Prod - Recomendado)
*   **Utilidades de Imagen**: Pillow / QR Code
*   **Seguridad**: Django CORS Headers, Middlewares de seguridad estándar.

## 3. Guía de Ingeniería

### 3.1 Configuración del Entorno (Local Environment Setup)

El establecimiento del entorno de desarrollo requiere precisión. Siga la secuencia estrictamente:

1.  **Aprovisionamiento del Entorno Virtual**:
    ```bash
    cd backend
    python -m venv venv
    # Windows
    .\venv\Scripts\activate
    # Unix/MacOS
    source venv/bin/activate
    ```

2.  **Resolución de Dependencias**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Variables de Entorno**:
    Crear un archivo `.env` en la raíz de `backend/` con las siguientes definiciones críticas:
    ```ini
    DEBUG=True
    SECRET_KEY=su-clave-secreta-corporativa-aqui
    ALLOWED_HOSTS=localhost,127.0.0.1
    ```

4.  **Inicialización de Base de Datos**:
    ```bash
    python manage.py makemigrations
    python manage.py migrate
    ```

5.  **Ejecución del Servicio**:
    ```bash
    python manage.py runserver
    ```

### 3.2 Estructura de Módulos

*   `sabbath_backend/`: Configuración global del proyecto (settings, urls).
*   `core/`: Aplicación principal (modelos, vistas, serializadores).
*   `media/`: Almacenamiento de archivos generados y subidos por usuarios.

## 4. Protocolos de Desarrollo

*   **Modelado de Datos**: Cualquier cambio en `models.py` **debe** ser acompañado por su respectiva migración.
*   **Endpoints API**: Todos los nuevos endpoints deben estar documentados y probados.
*   **Calidad de Código**: Mantener funciones pequeñas y principios DRY (Don't Repeat Yourself).

---

**Sabbath Engineering Team**
*Infraestructura Backend de Clase Mundial*
asd