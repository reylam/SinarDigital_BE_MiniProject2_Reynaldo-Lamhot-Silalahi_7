import prisma from "../config/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const login = async (req, res) => {
  try {
    const { email, password } = req.validatedData;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, roleId: user.roleId },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        token,
        status: "online",
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    const { password: _, token: __, ...safeUser } = updatedUser;

    res.json({
      message: "Login successful",
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        token: null,
        status: "offline",
      },
    });

    res.json({ message: "Logout successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({
      message: "Users retrieved successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        role: {
          select: {
            id: true,
            name: true,
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    res.json({
      message: "Profile retrieved successfully",
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { status } = req.validatedData;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({
      message: "User status updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update status error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({
        error: "User not found",
        message: `User with ID ${req.params.id} does not exist`,
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getTasks = async (req, res) => {
  try {
    const where = {};

    if (req.query.status) {
      where.status = req.query.status;
    }

    if (req.query.assigned_to) {
      where.assignedToId = parseInt(req.query.assigned_to);
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    res.json({
      message: "Tasks retrieved successfully",
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, assigned_to, due_date, attachment } =
      req.validatedData;

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status: "pending",
        assignedToId: parseInt(assigned_to),
        createdById: req.user.id,
        dueDate: new Date(due_date),
        attachment: attachment || null,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Task created successfully",
      task: newTask,
    });
  } catch (error) {
    console.error("Create task error:", error);

    if (error.code === "P2003") {
      return res.status(400).json({
        error: "Invalid user ID",
        message: "The assigned user does not exist",
      });
    }

    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const updateData = req.validatedData;

    if (updateData.due_date) {
      updateData.dueDate = new Date(updateData.due_date);
      delete updateData.due_date;
    }
    if (updateData.assigned_to) {
      updateData.assignedToId = updateData.assigned_to;
      delete updateData.assigned_to;
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update task error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({
        error: "Task not found",
        message: `Task with ID ${req.params.id} does not exist`,
      });
    }

    if (error.code === "P2003") {
      return res.status(400).json({
        error: "Invalid user ID",
        message: "The assigned user does not exist",
      });
    }

    res.status(500).json({ error: "Internal server error" });
  }
};

export const getJobs = async (req, res) => {
  try {
    const where = {};

    if (req.query.status) {
      where.status = req.query.status;
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        applicants: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    res.json({
      message: "Jobs retrieved successfully",
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Get jobs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getJobSeekersByJobId = async (req, res) => {
  try {
    const jobId = parseInt(req.params.jobId);

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        applicants: {
          orderBy: {
            experienceYears: "desc",
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!job) {
      return res.status(404).json({
        error: "Job not found",
        message: `Job with ID ${jobId} does not exist`,
      });
    }

    res.json({
      message: "Job applicants retrieved successfully",
      count: job.applicants.length,
      job_seekers: job.applicants,
      job: {
        id: job.id,
        title: job.title,
        description: job.description,
        attachment: job.attachment,
        createdBy: job.createdBy,
      },
    });
  } catch (error) {
    console.error("Get job seekers error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createJob = async (req, res) => {
  try {
    const { title, description, attachment } = req.validatedData;

    const newJob = await prisma.job.create({
      data: {
        title,
        description,
        status: "open",
        createdById: req.user.id,
        attachment: attachment || null,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Job created successfully",
      job: newJob,
    });
  } catch (error) {
    console.error("Create job error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getJobSeekers = async (req, res) => {
  try {
    const jobSeekers = await prisma.jobSeeker.findMany({
      include: {
        appliedJob: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    res.json({
      message: "Job seekers retrieved successfully",
      count: jobSeekers.length,
      job_seekers: jobSeekers,
    });
  } catch (error) {
    console.error("Get job seekers error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createJobSeeker = async (req, res) => {
  try {
    const { name, email, skills, experience_years, applied_job_id } =
      req.validatedData;

    const newJobSeeker = await prisma.jobSeeker.create({
      data: {
        name,
        email,
        skills,
        experienceYears: parseInt(experience_years),
        appliedJobId: parseInt(applied_job_id),
      },
      include: {
        appliedJob: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Job application submitted successfully",
      job_seeker: newJobSeeker,
    });
  } catch (error) {
    console.error("Create job seeker error:", error);
    if (error.code === "P2002") {
      return res.status(400).json({
        error: "Email already exists",
        message: "A job seeker with this email already exists",
      });
    }
    if (error.code === "P2003") {
      return res.status(400).json({
        error: "Invalid job ID",
        message: "The specified job does not exist",
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalTasks,
      completedTasks,
      pendingTasks,
      totalJobs,
      openJobs,
      totalApplicants,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.task.count(),
      prisma.task.count({ where: { status: "completed" } }),
      prisma.task.count({ where: { status: "pending" } }),
      prisma.job.count(),
      prisma.job.count({ where: { status: "open" } }),
      prisma.jobSeeker.count(),
    ]);

    const stats = {
      totalUsers,
      totalTasks,
      completedTasks,
      pendingTasks,
      totalJobs,
      openJobs,
      totalApplicants,
    };

    res.json({
      message: "Dashboard stats retrieved successfully",
      stats,
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
