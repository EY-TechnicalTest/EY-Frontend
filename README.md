# EY Frontend - Supplier Due Diligence & Screening SPA

Aplicación de página única (*Single Page Application - SPA*) desarrollada en **React 19** y **Vite**, con interfaz corporativa de **Ernst & Young (EY)** para la gestión y debida diligencia de proveedores.


---

## Estructura del Proyecto

El código está estructurado por capas y características de negocio (*Feature-based architecture*):

```text
src/
├── api/
│   └── apiClient.js             # Configuración centralizada de Fetch/Axios e inyección de Bearer Token
├── assets/                      # Logotipos e imágenes corporativas
├── components/
│   ├── Navbar.jsx               # Encabezado corporativo (conteo en vivo de proveedores, usuario activo, cerrar sesión)
│   ├── Pagination.jsx           # Paginación numérica y botones Anterior/Siguiente
│   └── Toast.jsx                # Componente de notificaciones flotantes
├── context/
│   └── AuthContext.jsx          # Contexto global de sesión con validación de caducidad JWT
├── features/
│   ├── auth/
│   │   ├── authService.js       # Login, logout, decodificación y chequeo isTokenExpired(token)
│   │   └── LoginModal.jsx       # Formulario y validaciones de credenciales
│   ├── compliance/
│   │   ├── components/
│   │   │   └── ScreeningModal.jsx # Modal de debida diligencia (pestañas Resumen, SMV, SECOP, INTERPOL)
│   │   └── services/
│   │       └── screeningService.js    # Conexión al endpoint de screening del backend
│   └── suppliers/
│       ├── components/
│       │   ├── DeleteConfirmModal.jsx # Confirmación de eliminación de proveedor
│       │   ├── SupplierDetailModal.jsx# Vista detallada y representantes legales
│       │   ├── SupplierModal.jsx      # Modal de creación y edición con validaciones
│       │   └── SupplierTable.jsx      # Tabla interactiva con búsqueda y acciones
│       └── services/
│           └── supplierService.js     # Consumo de endpoints REST (/api/suppliers)
├── pages/
│   ├── Dashboard.jsx            # Pantalla principal con métricas, tabla y modales
│   └── LoginPage.jsx            # Pantalla de acceso
├── App.jsx                      # Orquestador del estado y vistas
├── App.css                      # Estilos globales y corporativos
└── main.jsx                     # Punto de entrada de React 19
```




## Validaciones de Entrada en Formularios

El formulario de proveedores (`SupplierModal.jsx`) implementa validaciones estrictas en tiempo real:

1. **Razón Social / Nombre Comercial**: Obligatorio, longitud máxima de 200 caracteres.
2. **Número de Identificación Fiscal (Tax ID / RUC)**: 
   - Exactamente **11 dígitos numéricos** (validado por expresión regular `/^\d{11}$/`).
3. **Teléfono de Contacto**: Formato telefónico internacional con código de país opcional.
4. **Correo Electrónico**: Validación de estructura RFC de email corporativo.
5. **Sitio Web**: Formato de URL válido (`http://` o `https://`).
6. **Facturación Anual**: Valor numérico mayor o igual a 0.
7. **Representantes Legales**: Al menos un representante legal requerido con nombre y apellido completos.

---

##  Configuración y Ejecución

### 1. Variables de Entorno (`.env`)
En el archivo `.env` en la raíz de `Frontend/EY-Frontend`:
```env
# Conexión al backend en Azure
VITE_API_URL=https://ey-backend-fabiola-ceb2cafgcxcxg0eh.canadacentral-01.azurewebsites.net

# O conexión a backend local si se está ejecutando localmente:
# VITE_API_URL=http://localhost:5000
```

### 2. Comandos de Ejecución

```bash
# Instalar paquetes
npm install

# Iniciar en modo desarrollo
npm run dev

# Compilar para producción (genera carpeta dist/)
npm run build

# Previsualizar el build de producción
npm run preview
```

El servidor local se iniciará en `http://localhost:5173`.
