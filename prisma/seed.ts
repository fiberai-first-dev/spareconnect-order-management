import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: { password },
    create: { username: "admin", password },
  });

  await prisma.order.deleteMany();

  await prisma.order.createMany({
    data: [
      {
        orderNo: "ORD-240601",
        orderDate: new Date("2024-06-01"),
        quotationStatus: "COMPLETED",
        confirmationStatus: "PENDING",
        deliveryStatus: "PENDING",
      },
      {
        orderNo: "ORD-240605",
        orderDate: new Date("2024-06-05"),
        quotationStatus: "COMPLETED",
        confirmationStatus: "CONFIRMED",
        deliveryStatus: "PENDING",
      },
      {
        orderNo: "ORD-240515",
        orderDate: new Date("2024-05-15"),
        quotationStatus: "COMPLETED",
        confirmationStatus: "CONFIRMED",
        deliveryStatus: "COMPLETED",
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
