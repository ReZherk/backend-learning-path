# 📝 Sistema de Notas — Proyecto de Aprendizaje

Proyecto mínimo para aprender el patrón:
**JwtAuthGuard → RolesGuard → PoliciesGuard → Controlador**

## Dominio

Un sistema donde usuarios crean **notas** que pertenecen a un **equipo**.

## Reglas de negocio

| Rol    | ¿Qué puede ver?          |
| ------ | ------------------------ |
| ADMIN  | Todas las notas          |
| EDITOR | Notas de su mismo equipo |
| LECTOR | Solo sus propias notas   |

## Estructura del proyecto

```
src/
├── common/
│   ├── enums/
│   │   └── role.enum.ts           ← Los roles del sistema
│   └── interfaces/
│       └── auth-user.interface.ts ← Shape del usuario autenticado
│
├── auth/
│   ├── strategies/
│   │   └── jwt.strategy.ts        ← Decodifica el JWT y busca el usuario
│   ├── guards/
│   │   ├── jwt-auth.guard.ts      ← Capa 1: ¿Tiene token válido?
│   │   ├── roles.guard.ts         ← Capa 2: ¿Tiene el rol correcto?
│   │   └── policies.guard.ts      ← Capa 3: ¿Puede ver ESTE recurso?
│   ├── decorators/
│   │   ├── roles.decorator.ts     ← @Roles(Role.ADMIN, ...)
│   │   └── check-policy.decorator.ts ← @CheckPolicy(...)
│   ├── policies/
│   │   └── note.policy.ts         ← Lógica: ¿quién puede ver una nota?
│   └── services/
│       └── authorization.service.ts ← Orquesta las policies
│
└── notas/
    ├── dto/
    │   └── nota-response.dto.ts   ← Shape de la respuesta
    ├── notas.controller.ts        ← El endpoint GET /notas/:id
    └── notas.service.ts           ← Lógica de negocio
```

## El flujo de una petición

```
GET /notas/:id
  ↓
JwtAuthGuard      → verifica token → adjunta req.user
  ↓
RolesGuard        → verifica req.user.role contra @Roles()
  ↓
PoliciesGuard     → busca la nota → ejecuta policy → adjunta req.nota
  ↓
Controlador       → lee req.nota (ya resuelto por el guard)
  ↓
NotasService      → transforma la nota a DTO
  ↓
200 { id, titulo, contenido, ... }
```
