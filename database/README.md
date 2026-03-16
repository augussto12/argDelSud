# 📂 database/

Archivos SQL organizados para el esquema `argentinos_del_sud` del Club Argentinos del Sud.

## Estructura

```
database/
├── README.md           ← Este archivo
├── 00_schema.sql       ← Crea el esquema y extensiones
├── 01_tables.sql       ← Todas las tablas en orden de dependencias
├── 02_indexes.sql      ← Índices de performance
├── 03_seed.sql         ← Datos iniciales (días, roles, admin)
├── 04_seed_demo.sql    ← Datos de prueba (alumnos, profesores, talleres...)
└── 99_drop_all.sql     ← ⚠️ Elimina todo (solo en dev)
```

## Uso

### Primera vez (crear todo + datos iniciales)
```bash
psql -U user -d mydb -f database/00_schema.sql
psql -U user -d mydb -f database/01_tables.sql
psql -U user -d mydb -f database/02_indexes.sql
psql -U user -d mydb -f database/03_seed.sql
```

### Cargar datos de prueba (opcional)
```bash
psql -U user -d mydb -f database/04_seed_demo.sql
```

### Borrar todo y empezar de cero (⚠️ DESTRUCTIVO)
```bash
psql -U user -d mydb -f database/99_drop_all.sql
```

## Notas

- Todas las tablas viven en el esquema `argentinos_del_sud`
- El backend usa **Prisma ORM** como fuente de verdad (`prisma/schema.prisma`)
- Estos SQL son un espejo manual para deploy directo, portabilidad, y documentación
- Si se modifica el schema de Prisma, hay que actualizar estos archivos también
