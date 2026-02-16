# Docker - Flujo Básico y Primeros Pasos

## Prerequisitos

Antes de seguir este tutorial, asegúrate de tener:

- Docker instalado en tu sistema
- Permisos para ejecutar comandos Docker
- Terminal/consola disponible

**Verificar instalación:**

```bash
docker --version
docker info
```

## Conceptos básicos

### ¿Qué es una imagen Docker?

Una **imagen** es una plantilla de solo lectura que contiene el sistema de archivos y la configuración necesaria para ejecutar una aplicación. Es como un snapshot o template inmutable.

**Características:**

- Read-only (inmutable)
- Compuesta de capas (layers)
- Se descarga desde Docker Hub u otros registros
- Base para crear contenedores

### ¿Qué es un contenedor Docker?

Un **contenedor** es una instancia en ejecución de una imagen. Es un proceso aislado que corre en el host con su propio filesystem, red y recursos.

**Características:**

- Instancia mutable de una imagen
- Tiene su propio estado
- Se puede iniciar, detener, eliminar
- Aislado del sistema host

**Analogía:**

- **Imagen** = Clase (plantilla)
- **Contenedor** = Objeto/Instancia (en ejecución)

## Flujo básico paso a paso

### 1. Hello World - Primera prueba

El contenedor `hello-world` es la forma más simple de verificar que Docker funciona correctamente.

```bash
docker run hello-world
```

**¿Qué sucede?**

1. Docker busca la imagen `hello-world` localmente
2. Si no existe, la descarga de Docker Hub
3. Crea un contenedor desde la imagen
4. Ejecuta el contenedor (imprime mensaje)
5. El contenedor se detiene automáticamente

**Output esperado:**

```
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
...
Hello from Docker!
This message shows that your installation appears to be working correctly.
...
```

**Características del contenedor hello-world:**

- Tamaño: ~20 KB
- Se ejecuta una sola vez y termina
- No queda activo
- Útil solo para verificación

### 2. Verificar contenedores

#### Ver contenedores activos

```bash
docker ps
```

**Muestra:**

- Solo contenedores en ejecución actualmente
- Columnas: CONTAINER ID, IMAGE, COMMAND, STATUS, PORTS, NAMES

**Ejemplo de output:**

```
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

(Vacío si no hay contenedores activos)

#### Ver todos los contenedores

```bash
docker ps -a
```

**Muestra:**

- Todos los contenedores (activos y detenidos)
- Incluye contenedores que terminaron su ejecución

**Ejemplo de output:**

```
CONTAINER ID   IMAGE         COMMAND    CREATED         STATUS                     NAMES
a1b2c3d4e5f6   hello-world   "/hello"   2 minutes ago   Exited (0) 2 minutes ago   quirky_tesla
```

**Columnas importantes:**

| Columna      | Descripción                           |
| ------------ | ------------------------------------- |
| CONTAINER ID | Identificador único corto             |
| IMAGE        | Imagen base usada                     |
| COMMAND      | Comando ejecutado al iniciar          |
| CREATED      | Cuándo se creó                        |
| STATUS       | Estado actual (Running, Exited, etc.) |
| NAMES        | Nombre asignado (aleatorio o manual)  |

#### Opciones útiles de docker ps

```bash
# Ver solo IDs de contenedores
docker ps -q

# Ver últimos N contenedores
docker ps -n 5

# Ver contenedores con tamaño
docker ps -s

# Filtrar por estado
docker ps -a --filter "status=exited"

# Formato personalizado
docker ps --format "table {{.ID}}\t{{.Image}}\t{{.Status}}"
```

### 3. Contenedor interactivo con Ubuntu

Ejecutar un contenedor Ubuntu con shell interactivo:

```bash
docker run -it ubuntu bash
```

**Explicación de flags:**

- `-i` (interactive) - Mantiene STDIN abierto
- `-t` (tty) - Asigna un pseudo-terminal
- `ubuntu` - Imagen a usar
- `bash` - Comando a ejecutar

**¿Qué sucede?**

1. Descarga imagen de Ubuntu si no existe (~70 MB)
2. Crea contenedor
3. Inicia bash dentro del contenedor
4. Te da acceso al shell

**Estarás dentro del contenedor:**

```bash
root@a1b2c3d4e5f6:/#
```

**Comandos para probar dentro:**

```bash
# Ver sistema operativo
cat /etc/os-release

# Listar archivos
ls -la

# Directorio actual
pwd

# Procesos en ejecución
ps aux

# Actualizar repositorios
apt update

# Instalar algo (ej: curl)
apt install -y curl

# Verificar instalación
curl --version
```

**Importante:**

- Todo lo que instales existe solo en ese contenedor
- Si eliminas el contenedor, los cambios se pierden
- Cada `docker run` crea un nuevo contenedor limpio

#### Salir del contenedor

```bash
exit
```

O presiona `Ctrl + D`

**Después de salir:**

- El contenedor se detiene automáticamente
- Puedes verlo con `docker ps -a`
- Los cambios persisten en ese contenedor específico (pero no en la imagen)

### 4. Detener contenedores

Si tienes un contenedor en ejecución continua (ej: servidor web):

```bash
docker stop <CONTAINER_ID>
```

**Ejemplos:**

```bash
# Detener por ID
docker stop a1b2c3d4e5f6

# Detener por nombre
docker stop quirky_tesla

# Detener múltiples
docker stop container1 container2 container3

# Detener todos los contenedores activos
docker stop $(docker ps -q)
```

**¿Qué hace `stop`?**

1. Envía señal SIGTERM al proceso principal
2. Espera 10 segundos (configurable)
3. Si no se detiene, envía SIGKILL

**Detener con timeout personalizado:**

```bash
docker stop -t 30 <CONTAINER_ID>  # Espera 30 segundos
```

#### Forzar detención

```bash
docker kill <CONTAINER_ID>
```

**Diferencia:**

- `stop` - Detención controlada (SIGTERM → SIGKILL)
- `kill` - Detención forzada inmediata (SIGKILL)

### 5. Eliminar contenedores

#### Eliminar un contenedor específico

```bash
docker rm <CONTAINER_ID>
```

**Nota:** El contenedor debe estar detenido primero.

**Ejemplos:**

```bash
# Eliminar por ID
docker rm a1b2c3d4e5f6

# Eliminar por nombre
docker rm quirky_tesla

# Eliminar múltiples
docker rm container1 container2

# Forzar eliminación (aunque esté corriendo)
docker rm -f <CONTAINER_ID>

# Eliminar y sus volúmenes asociados
docker rm -v <CONTAINER_ID>
```

#### Limpiar contenedores detenidos

```bash
docker container prune
```

**¿Qué hace?**

- Elimina TODOS los contenedores detenidos
- Libera espacio en disco
- Pide confirmación (usar `-f` para forzar)

**Output esperado:**

```
WARNING! This will remove all stopped containers.
Are you sure you want to continue? [y/N] y
Deleted Containers:
a1b2c3d4e5f6
b2c3d4e5f6g7
...

Total reclaimed space: 125 MB
```

**Sin confirmación:**

```bash
docker container prune -f
```

**Filtrar por tiempo:**

```bash
# Eliminar contenedores detenidos hace más de 24 horas
docker container prune --filter "until=24h"
```

### 6. Gestión de imágenes

#### Listar imágenes

```bash
docker images
```

**Output:**

```
REPOSITORY    TAG       IMAGE ID       CREATED       SIZE
ubuntu        latest    a1b2c3d4e5f6   2 weeks ago   77.8MB
hello-world   latest    b2c3d4e5f6g7   8 months ago  13.3kB
```

**Columnas:**

| Columna    | Descripción                           |
| ---------- | ------------------------------------- |
| REPOSITORY | Nombre de la imagen                   |
| TAG        | Versión/etiqueta (latest por defecto) |
| IMAGE ID   | Identificador único                   |
| CREATED    | Cuándo se creó la imagen              |
| SIZE       | Tamaño en disco                       |

**Opciones útiles:**

```bash
# Ver solo IDs
docker images -q

# Filtrar por nombre
docker images ubuntu

# Incluir imágenes intermedias
docker images -a

# Ver imágenes dangling (sin tag)
docker images -f "dangling=true"
```

#### Eliminar imágenes

```bash
# Eliminar por nombre
docker rmi ubuntu

# Eliminar por ID
docker rmi a1b2c3d4e5f6

# Eliminar por nombre:tag
docker rmi ubuntu:20.04

# Forzar eliminación
docker rmi -f ubuntu

# Eliminar múltiples
docker rmi ubuntu hello-world nginx
```

**Importante:**

No puedes eliminar una imagen si hay contenedores (incluso detenidos) que la usan. Primero elimina los contenedores.

#### Limpiar imágenes no usadas

```bash
# Eliminar imágenes sin contenedores asociados
docker image prune

# Eliminar TODAS las imágenes no usadas (incluye sin tag)
docker image prune -a

# Sin confirmación
docker image prune -a -f

# Eliminar imágenes no usadas hace más de X tiempo
docker image prune -a --filter "until=168h"  # 7 días
```

**Diferencia:**

- `docker image prune` - Solo imágenes dangling (sin tag)
- `docker image prune -a` - Todas las imágenes no usadas por contenedores

#### Información de una imagen

```bash
docker inspect ubuntu
docker history ubuntu
```

### 7. Nombrar contenedores

Por defecto, Docker asigna nombres aleatorios (ej: `quirky_tesla`, `angry_darwin`).

**Asignar nombre personalizado:**

```bash
docker run -it --name mi-ubuntu ubuntu bash
```

**Ventajas:**

- Más fácil de identificar
- Más fácil de referenciar en comandos
- Nombres descriptivos

**Ejemplos:**

```bash
docker run -d --name web-server nginx
docker run -d --name db-mysql mysql
docker run -it --name dev-env ubuntu bash
```

**Operaciones con nombres:**

```bash
docker stop mi-ubuntu
docker start mi-ubuntu
docker rm mi-ubuntu
docker logs mi-ubuntu
```

### 8. Reiniciar contenedores

Un contenedor detenido puede reiniciarse:

```bash
docker start <CONTAINER_ID>
```

**Ejemplos:**

```bash
# Iniciar contenedor detenido
docker start mi-ubuntu

# Iniciar y adjuntar a terminal
docker start -ai mi-ubuntu

# Iniciar múltiples
docker start container1 container2
```

**Diferencia `run` vs `start`:**

| Comando        | Acción                                 |
| -------------- | -------------------------------------- |
| `docker run`   | Crea NUEVO contenedor desde imagen     |
| `docker start` | Inicia contenedor existente (detenido) |

## Flujo completo resumido

### Ciclo de vida de un contenedor

```bash
# 1. Crear y ejecutar contenedor
docker run hello-world

# 2. Ver contenedores (incluye detenidos)
docker ps -a

# 3. Ejecutar contenedor interactivo
docker run -it --name mi-ubuntu ubuntu bash
# ... trabajar dentro ...
exit

# 4. Listar contenedores
docker ps -a

# 5. Reiniciar contenedor existente
docker start mi-ubuntu

# 6. Detener contenedor activo
docker stop mi-ubuntu

# 7. Eliminar contenedor
docker rm mi-ubuntu

# 8. Listar imágenes
docker images

# 9. Eliminar imagen
docker rmi ubuntu

# 10. Limpiar todo
docker container prune
docker image prune -a
```

## Comandos de limpieza masiva

### Limpiar todo el sistema

```bash
# Eliminar:
# - Contenedores detenidos
# - Redes no usadas
# - Imágenes sin contenedores
# - Caché de build
docker system prune

# Incluir imágenes no usadas
docker system prune -a

# Sin confirmación
docker system prune -a -f

# Ver cuánto espacio se puede liberar
docker system df
```

**Output de `docker system df`:**

```
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          5         2         1.5GB     900MB (60%)
Containers      10        2         200MB     180MB (90%)
Local Volumes   3         1         500MB     400MB (80%)
Build Cache     0         0         0B        0B
```

### Script de limpieza completa

```bash
#!/bin/bash
# Limpiar Docker completamente

echo "Deteniendo contenedores activos..."
docker stop $(docker ps -q)

echo "Eliminando contenedores..."
docker rm $(docker ps -aq)

echo "Eliminando imágenes..."
docker rmi $(docker images -q)

echo "Limpieza del sistema..."
docker system prune -af --volumes

echo "Limpieza completa!"
docker system df
```

## Comandos útiles adicionales

### Logs de contenedor

```bash
# Ver logs
docker logs <CONTAINER_ID>

# Ver logs en tiempo real (follow)
docker logs -f <CONTAINER_ID>

# Ver últimas 100 líneas
docker logs --tail 100 <CONTAINER_ID>

# Ver logs desde timestamp
docker logs --since 2024-01-30T10:00:00 <CONTAINER_ID>
```

### Ejecutar comando en contenedor activo

```bash
# Ejecutar comando en contenedor activo
docker exec -it <CONTAINER_ID> bash

# Ejecutar comando específico
docker exec <CONTAINER_ID> ls -la

# Ejemplo: Ver archivos en contenedor nginx
docker exec web-server ls /usr/share/nginx/html
```

### Copiar archivos

```bash
# De host a contenedor
docker cp archivo.txt <CONTAINER_ID>:/ruta/destino/

# De contenedor a host
docker cp <CONTAINER_ID>:/ruta/archivo.txt ./

# Ejemplo
docker cp index.html web-server:/usr/share/nginx/html/
```

### Estadísticas de contenedores

```bash
# Ver uso de recursos en tiempo real
docker stats

# Solo un contenedor específico
docker stats <CONTAINER_ID>

# Sin streaming (una vez)
docker stats --no-stream
```

## Errores comunes

### Error 1: Contenedor con nombre ya existe

```bash
docker run --name mi-ubuntu ubuntu
# Error: The container name "/mi-ubuntu" is already in use
```

**Soluciones:**

```bash
# Opción 1: Usar nombre diferente
docker run --name mi-ubuntu-2 ubuntu

# Opción 2: Eliminar contenedor existente
docker rm mi-ubuntu
docker run --name mi-ubuntu ubuntu

# Opción 3: No especificar nombre (Docker genera uno)
docker run ubuntu
```

### Error 2: No se puede eliminar imagen en uso

```bash
docker rmi ubuntu
# Error: image is being used by stopped container
```

**Solución:**

```bash
# Ver contenedores que usan la imagen
docker ps -a --filter ancestor=ubuntu

# Eliminar contenedores primero
docker rm <CONTAINER_ID>

# Luego eliminar imagen
docker rmi ubuntu

# O forzar (no recomendado)
docker rmi -f ubuntu
```

### Error 3: Permisos insuficientes

```bash
docker ps
# Got permission denied while trying to connect to the Docker daemon socket
```

**Solución en Linux:**

```bash
# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Reloguear o ejecutar
newgrp docker

# O usar sudo (no recomendado)
sudo docker ps
```

### Error 4: Contenedor no se detiene

```bash
docker stop <CONTAINER_ID>
# Espera indefinidamente...
```

**Solución:**

```bash
# Forzar detención
docker kill <CONTAINER_ID>

# O usar timeout más corto
docker stop -t 5 <CONTAINER_ID>
```

## Buenas prácticas

### 1. Nombres descriptivos

```bash
# ❌ Mal
docker run -d --name c1 nginx

# ✔ Bien
docker run -d --name web-server-prod nginx
```

### 2. Limpiar regularmente

```bash
# Crear alias útil
alias docker-clean='docker system prune -a -f'

# Ejecutar semanalmente
docker-clean
```

### 3. No dejar contenedores huérfanos

```bash
# Ver contenedores detenidos hace mucho tiempo
docker ps -a --filter "status=exited"

# Limpiar
docker container prune
```

### 4. Usar tags específicos

```bash
# ❌ Mal - Puede cambiar
docker run ubuntu

# ✔ Bien - Versión específica
docker run ubuntu:20.04
```

### 5. Eliminar contenedores automáticamente

```bash
# --rm elimina el contenedor al salir
docker run --rm -it ubuntu bash
```

**Útil para:**

- Pruebas rápidas
- Contenedores temporales
- Evitar acumulación de contenedores

## Próximos pasos

Una vez domines estos conceptos básicos, puedes avanzar a:

1. **Contenedores con servicios** - Nginx, MySQL, Redis
2. **Mapeo de puertos** - Exponer servicios al host
3. **Volúmenes** - Persistencia de datos
4. **Dockerfile** - Crear imágenes personalizadas
5. **Docker Compose** - Orquestar múltiples contenedores
6. **Redes** - Comunicación entre contenedores

## Recursos

**Documentación oficial:**

- [Docker Docs](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)

**Referencia de comandos:**

- [Docker CLI Reference](https://docs.docker.com/engine/reference/commandline/docker/)

## Resumen de comandos esenciales

```bash
# Imágenes
docker images                    # Listar imágenes
docker pull <imagen>             # Descargar imagen
docker rmi <imagen>              # Eliminar imagen
docker image prune -a            # Limpiar imágenes no usadas

# Contenedores
docker ps                        # Listar activos
docker ps -a                     # Listar todos
docker run <imagen>              # Crear y ejecutar
docker start <container>         # Iniciar detenido
docker stop <container>          # Detener activo
docker rm <container>            # Eliminar
docker container prune           # Limpiar detenidos

# Interactivo
docker run -it <imagen> bash     # Ejecutar con shell
docker exec -it <container> bash # Entrar a contenedor activo

# Limpieza
docker system prune -a           # Limpiar todo
docker system df                 # Ver uso de espacio

# Información
docker logs <container>          # Ver logs
docker inspect <container>       # Ver detalles
docker stats                     # Ver estadísticas
```
