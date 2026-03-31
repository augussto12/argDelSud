import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    // Seed días
    const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    for (const nombre of dias) {
        await prisma.dia.upsert({
            where: { nombre },
            update: {},
            create: { nombre },
        });
    }

    // Seed roles
    const roles = ["superadmin", "admin", "profesor"];
    for (const nombre of roles) {
        await prisma.rol.upsert({
            where: { nombre },
            update: {},
            create: { nombre },
        });
    }

    // Seed usuario admin por defecto
    const adminRol = await prisma.rol.findUnique({ where: { nombre: "superadmin" } });
    if (adminRol) {
        const hashedPassword = await bcrypt.hash("admin123", 12);
        await prisma.usuario.upsert({
            where: { email: "admin@argdelsud.com" },
            update: {},
            create: {
                nombre: "Administrador",
                email: "admin@argdelsud.com",
                password: hashedPassword,
                rol_id: adminRol.id,
            },
        });
    }

    console.log("✅ Seed completado");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
