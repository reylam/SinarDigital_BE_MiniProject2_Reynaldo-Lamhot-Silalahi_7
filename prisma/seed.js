import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  await prisma.jobSeeker.deleteMany();
  await prisma.job.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();

  const permissions = await Promise.all([
    prisma.permission.create({ data: { name: "manage_users" } }),
    prisma.permission.create({ data: { name: "manage_tasks" } }),
    prisma.permission.create({ data: { name: "manage_jobs" } }),
    prisma.permission.create({ data: { name: "review_applicants" } }),
    prisma.permission.create({ data: { name: "view_reports" } }),
  ]);

  console.log("Permissions created");

  const adminRole = await prisma.role.create({
    data: {
      name: "admin",
      permissions: {
        create: permissions.map((permission) => ({
          permissionId: permission.id,
        })),
      },
    },
  });

  const managerRole = await prisma.role.create({
    data: {
      name: "manager",
      permissions: {
        create: permissions
          .filter((p) => p.name !== "manage_users")
          .map((permission) => ({
            permissionId: permission.id,
          })),
      },
    },
  });

  const userRole = await prisma.role.create({
    data: {
      name: "user",
      permissions: {
        create: permissions
          .filter((p) => p.name === "view_reports")
          .map((permission) => ({
            permissionId: permission.id,
          })),
      },
    },
  });

  console.log("Roles created");
  const hashedPassword = await bcrypt.hash("password123", 10);

  const adminUser = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      status: "offline",
      roleId: adminRole.id,
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      name: "Manager User",
      email: "manager@example.com",
      password: hashedPassword,
      status: "offline",
      roleId: managerRole.id,
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      name: "Regular User",
      email: "user@example.com",
      password: hashedPassword,
      status: "offline",
      roleId: userRole.id,
    },
  });

  console.log("Users created");

  // Create tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: "Design Homepage",
        description: "Create responsive homepage design with modern UI",
        status: "pending",
        assignedToId: regularUser.id,
        createdById: adminUser.id,
        dueDate: new Date("2025-12-31"),
        attachment:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRASgYggiphhcSz7jz90YlDxFi6e7dwaR0_-g&s",
      },
    }),
    prisma.task.create({
      data: {
        title: "API Documentation",
        description: "Document all API endpoints with examples",
        status: "in_progress",
        assignedToId: managerUser.id,
        createdById: adminUser.id,
        dueDate: new Date("2025-12-15"),
        attachment:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkg9yz_h3mJPj5eUioNass1iF4sOgWwR14gg&s",
      },
    }),
    prisma.task.create({
      data: {
        title: "Database Optimization",
        description: "Optimize queries and add indexes for better performance",
        status: "completed",
        assignedToId: regularUser.id,
        createdById: managerUser.id,
        dueDate: new Date("2025-11-30"),
        attachment:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfPzxm7m469aa87RHv8BYgeetrZQhVnx_5Cw&s",
      },
    }),
  ]);

  console.log("Tasks created");

  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        title: "Senior Frontend Developer",
        description:
          "Looking for experienced React developer with 5+ years experience",
        status: "open",
        createdById: adminUser.id,
        attachment:
          "https://dinperinaker.pekalongankota.go.id/upload/halaman/halaman_20230412104801.jpeg",
      },
    }),
    prisma.job.create({
      data: {
        title: "Backend Engineer",
        description: "Node.js developer with PostgreSQL experience",
        status: "open",
        createdById: managerUser.id,
        attachment:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMO-aOAN0MJ__qjdb985n6zW6gXO0fwlgHKA&s",
      },
    }),
    prisma.job.create({
      data: {
        title: "UI/UX Designer",
        description: "Creative designer for web and mobile applications",
        status: "closed",
        createdById: adminUser.id,
        attachment:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVi3whLoXjFk3I6klpnlYcaMOR9ZiUY-V7gw&s",
      },
    }),
  ]);

  console.log("Jobs created");

  const jobSeekers = await Promise.all([
    prisma.jobSeeker.create({
      data: {
        name: "John Doe",
        email: "john@example.com",
        skills: "React, Node.js, MongoDB",
        experienceYears: 5,
        appliedJobId: jobs[0].id,
      },
    }),
    prisma.jobSeeker.create({
      data: {
        name: "Jane Smith",
        email: "jane@example.com",
        skills: "Vue.js, Express, PostgreSQL",
        experienceYears: 3,
        appliedJobId: jobs[0].id,
      },
    }),
    prisma.jobSeeker.create({
      data: {
        name: "Bob Johnson",
        email: "bob@example.com",
        skills: "Figma, Adobe XD, Sketch",
        experienceYears: 4,
        appliedJobId: jobs[2].id,
      },
    }),
  ]);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
