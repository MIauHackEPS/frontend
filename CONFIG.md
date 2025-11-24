# Configuración del Frontend

## Variables de Entorno

El proyecto utiliza variables de entorno para configurar la conexión con la API backend.

### Configuración Inicial

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```

2. Edita el archivo `.env` según tu entorno:
   ```env
   API_URL=http://127.0.0.1:8001
   ```

3. Instala las dependencias con pnpm:
   ```bash
   pnpm install
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   pnpm dev
   ```

### Variables Disponibles

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `API_URL` | URL completa del backend API | `http://127.0.0.1:8001` |

### Diferentes Entornos

**Desarrollo Local:**
```env
API_URL=http://127.0.0.1:8001
```

**Producción:**
```env
API_URL=https://api.tudominio.com
```

**Otro servidor de desarrollo:**
```env
API_URL=http://192.168.1.100:8001
```

### Notas Importantes

- El archivo `.env` está en `.gitignore` y **no se debe subir al repositorio**
- Cada desarrollador puede tener su propia configuración local
- Si no se define `API_URL`, se usa el valor por defecto `http://127.0.0.1:8001`
- Después de modificar `.env`, debes **reiniciar el servidor de desarrollo**
