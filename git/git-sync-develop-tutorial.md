# Git - Integrar Cambios Remotos sin Perder Trabajo Local

## ¿Qué problema resuelve este flujo?

Cuando trabajas en una rama (ej: `develop`) y otros miembros del equipo han subido cambios al repositorio remoto, necesitas integrar esos cambios sin perder tu trabajo local.

**Escenario común:**

- Estás trabajando en una feature en `develop`
- Un compañero sube un fix o feature al mismo `develop` remoto
- Necesitas tener ambos cambios (los tuyos y los remotos)
- No quieres perder tu trabajo ni causar conflictos

**Este tutorial te muestra cómo sincronizar correctamente.**

## Flujo completo paso a paso

### 1. Guardar cambios locales

Antes de sincronizar con el remoto, asegura que tus cambios estén en un commit.

```bash
# Ver qué archivos cambiaron
git status

# Agregar todos los cambios
git add .

# Crear commit con mensaje descriptivo
git commit -m "feat(order-module): add order and promotion entities with enums"
```

**¿Por qué es importante?**

- Git solo puede integrar commits, no archivos sin guardar
- Evita perder cambios accidentalmente
- Facilita revertir si algo sale mal

### 2. Verificar rama actual

Confirma que estás en la rama correcta:

```bash
# Cambiar a develop si no estás ahí
git checkout develop

# Verificar estado actual
git status
```

**Posibles resultados de `git status`:**

```bash
# Tu rama está adelantada a 'origin/develop' por 1 commit
Your branch is ahead of 'origin/develop' by 1 commit.
```

**Interpretación:**

- Tienes 1 commit local que no existe en el remoto
- Es normal si acabas de hacer un commit

### 3. Traer cambios del remoto

Descarga los commits nuevos sin aplicarlos aún:

```bash
git fetch origin
```

**¿Qué hace `fetch`?**

- Descarga commits del remoto
- Actualiza referencias locales (`origin/develop`, `origin/main`, etc.)
- **NO modifica** tu rama de trabajo
- Es una operación segura (no puede romper nada)

**Diferencia con `pull`:**

| Comando     | Acción                                                |
| ----------- | ----------------------------------------------------- |
| `git fetch` | Solo descarga (seguro)                                |
| `git pull`  | Descarga + merge automático (puede causar conflictos) |

### 4. Revisar cambios remotos

Antes de integrar, revisa qué cambios hay:

```bash
# Ver commits nuevos en el remoto
git log origin/develop --oneline --graph

# Ver diferencias entre tu rama y el remoto
git log develop..origin/develop --oneline
```

**Ejemplo de output:**

```
a1b2c3d fix(payment): resolve validation error
d4e5f6g docs: update API documentation
```

**Interpretación:**

- Hay 2 commits en el remoto que no tienes localmente
- Son fixes/features que otros desarrolladores subieron

### 5. Integrar cambios (dos opciones)

Tienes dos estrategias principales:

#### Opción A: Merge (preserva historial completo)

```bash
git merge origin/develop
```

**Ventajas:**

- ✔ Preserva historial completo
- ✔ Muestra claramente cuándo se integraron cambios
- ✔ Más seguro para principiantes

**Desventajas:**

- ❌ Crea un commit extra de merge
- ❌ Historial puede verse "sucio"

**Resultado:**

```
*   Merge branch 'origin/develop' into develop
|\
| * fix(payment): resolve validation error
* | feat(order-module): add order entities
|/
```

#### Opción B: Rebase (historial lineal limpio)

```bash
git rebase origin/develop
```

**Ventajas:**

- ✔ Historial lineal y limpio
- ✔ No hay commits de merge
- ✔ Más fácil de leer

**Desventajas:**

- ❌ Reescribe historial (cambia SHAs de commits)
- ❌ Más difícil de resolver conflictos complejos

**Resultado:**

```
* feat(order-module): add order entities
* fix(payment): resolve validation error
```

**Output exitoso:**

```
Successfully rebased and updated refs/heads/develop.
```

**Interpretación:**

- Tus commits se reaplicaron encima de los remotos
- Historial quedó lineal
- No hubo conflictos

### Cuándo usar cada estrategia

| Situación                       | Recomendación                               |
| ------------------------------- | ------------------------------------------- |
| Rama personal o feature branch  | **Rebase** (historial limpio)               |
| Rama compartida (develop, main) | **Merge** (más seguro)                      |
| Conflictos complejos esperados  | **Merge** (más fácil resolver)              |
| Commits ya publicados (pushed)  | **Merge** (no reescribir historial público) |

### 6. Resolver conflictos (si aparecen)

Si Git no puede integrar automáticamente:

#### Durante Merge

```bash
# Git se detiene y marca archivos en conflicto
# Editar archivos con conflictos

# Marcar como resueltos
git add <archivo_conflictivo>

# Completar merge
git commit
```

#### Durante Rebase

```bash
# Git se detiene en el primer commit con conflicto
# Editar archivos con conflictos

# Marcar como resueltos
git add <archivo_conflictivo>

# Continuar rebase
git rebase --continue

# Si el conflicto es muy complejo, abortar:
git rebase --abort  # Vuelve al estado anterior
```

#### Formato de conflictos en archivos

```java
<<<<<<< HEAD
// Tu código local
private String localChange;
=======
// Código del remoto
private String remoteChange;
>>>>>>> origin/develop
```

**Resolver:**

1. Decidir qué código mantener
2. Eliminar marcadores (`<<<<<<<`, `=======`, `>>>>>>>`)
3. Guardar archivo
4. `git add` para marcar como resuelto

### 7. Verificar historial

Revisa cómo quedó integrado:

```bash
# Ver historial gráfico
git log --oneline --graph --decorate --all

# Ver solo últimos 5 commits
git log --oneline --graph -5

# Ver con más detalle
git log --graph --pretty=format:'%h - %s (%an, %ar)'
```

**Ejemplo de output esperado:**

```
* a1b2c3d feat(order-module): add order entities (Tu nombre, hace 5 minutos)
* d4e5f6g fix(payment): resolve validation error (Otro dev, hace 2 horas)
* 7g8h9i0 docs: update API documentation (Otro dev, hace 3 horas)
```

### 8. Subir cambios al remoto

Una vez integrado todo localmente, actualiza el repositorio remoto:

```bash
git push origin develop
```

**Posibles errores:**

#### Error: Updates were rejected

```bash
! [rejected]        develop -> develop (non-fast-forward)
```

**Causa:**

Hay más commits remotos que no tenías (alguien hizo push mientras trabajabas).

**Solución:**

Repetir el proceso desde el paso 3 (`git fetch origin`).

#### Forzar push (⚠️ PELIGROSO)

```bash
git push origin develop --force-with-lease
```

**Solo usar si:**

- Estás seguro de que nadie más trabaja en esa rama
- Sabes exactamente qué estás haciendo
- Es tu rama personal (no compartida)

### 9. Crear respaldo antes de integrar (recomendado)

Para protegerte ante errores:

```bash
# Crear rama de respaldo
git branch backup-develop

# O crear y cambiar a ella
git checkout -b backup-develop
```

**Si algo sale mal:**

```bash
# Volver al respaldo
git checkout develop
git reset --hard backup-develop

# Borrar respaldo cuando ya no lo necesites
git branch -D backup-develop
```

## Comandos útiles adicionales

### Ver estado de sincronización

```bash
# Ver diferencias entre local y remoto
git status -sb

# Ver cuántos commits estás adelante/atrás
git rev-list --left-right --count origin/develop...develop
```

### Descartar cambios locales

```bash
# Descartar cambios no commiteados
git reset --hard

# Descartar commits locales y sincronizar con remoto
git reset --hard origin/develop
```

**⚠️ ADVERTENCIA:** Estos comandos eliminan cambios permanentemente.

### Stash temporal

Si quieres integrar pero no estás listo para hacer commit:

```bash
# Guardar cambios temporalmente
git stash

# Traer e integrar cambios remotos
git fetch origin
git rebase origin/develop

# Recuperar cambios guardados
git stash pop
```

## Flujo completo resumido

```bash
# 1. Guardar trabajo
git add .
git commit -m "feat: descripción del cambio"

# 2. Verificar rama
git checkout develop
git status

# 3. Traer cambios
git fetch origin

# 4. Revisar cambios remotos (opcional)
git log origin/develop --oneline --graph

# 5. Integrar (elegir UNA opción)
git merge origin/develop      # Opción A: Merge
git rebase origin/develop     # Opción B: Rebase

# 6. Resolver conflictos si aparecen
# (Editar archivos, luego:)
git add <archivos>
git rebase --continue  # o git commit si fue merge

# 7. Verificar resultado
git log --oneline --graph -5

# 8. Subir cambios
git push origin develop
```

## Errores comunes y soluciones

### Error 1: Cambios sin commitear bloquean merge/rebase

```bash
error: Your local changes to the following files would be overwritten by merge
```

**Solución:**

```bash
# Opción 1: Hacer commit
git add .
git commit -m "WIP: work in progress"

# Opción 2: Guardar temporalmente
git stash
```

### Error 2: Conflictos complejos durante rebase

**Solución:**

```bash
# Abortar rebase
git rebase --abort

# Usar merge en su lugar
git merge origin/develop
```

### Error 3: Olvidé hacer fetch antes de merge/rebase

**Síntoma:**

Git dice que ya estás actualizado cuando sabes que hay cambios remotos.

**Solución:**

```bash
git fetch origin
git merge origin/develop
```

### Error 4: Forcé push y sobrescribí cambios de otros

**Prevención:**

```bash
# En lugar de --force, usar:
git push --force-with-lease origin develop
```

**Recuperación (si aún hay copia remota):**

```bash
# Ver reflog del remoto
git reflog show origin/develop

# Restaurar a commit anterior
git reset --hard <commit-sha>
```

## Buenas prácticas

### Antes de empezar el día

```bash
git checkout develop
git fetch origin
git rebase origin/develop  # o merge
```

### Antes de hacer push

```bash
git fetch origin
git rebase origin/develop  # Actualizar primero
git push origin develop
```

### Commits frecuentes

```bash
# Hacer commits pequeños y frecuentes
git add .
git commit -m "feat: implement user validation"

# Más fácil de integrar que un commit gigante
```

### Mensajes de commit descriptivos

```bash
# ❌ Mal
git commit -m "fix"
git commit -m "changes"

# ✔ Bien
git commit -m "fix(auth): resolve token expiration issue"
git commit -m "feat(user): add email validation"
```

## Herramientas visuales

Si prefieres interfaces gráficas:

- **GitKraken** - Cliente Git visual
- **SourceTree** - Gratis, muy intuitivo
- **VS Code Git Graph** - Extensión para VS Code
- **GitHub Desktop** - Simple para principiantes

Todas facilitan ver el historial y resolver conflictos visualmente.

## Resumen

**Flujo básico:**

1. ✅ Commitear cambios locales
2. ✅ Hacer `git fetch origin`
3. ✅ Integrar con `merge` o `rebase`
4. ✅ Resolver conflictos si aparecen
5. ✅ Hacer `git push origin develop`

**Resultado:**

- ✔ No pierdes tus commits locales
- ✔ Integras cambios remotos
- ✔ Historial limpio y ordenado
- ✔ Equipo sincronizado

**Regla de oro:**

> Siempre `fetch` antes de `merge/rebase`, y siempre `merge/rebase` antes de `push`.
