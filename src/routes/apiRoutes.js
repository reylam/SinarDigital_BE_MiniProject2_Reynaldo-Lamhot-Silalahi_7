import express from "express";
import {
  login,
  logout,
  getUsers,
  getUserProfile,
  updateUserStatus,
  getTasks,
  createTask,
  updateTask,
  getJobs,
  createJob,
  getJobSeekers,
  createJobSeeker,
  getDashboard,
  getJobSeekersByJobId,
} from "../controllers/apiController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import {
  validate,
  loginSchema,
  userStatusSchema,
  taskSchema,
  jobSchema,
  jobSeekerSchema,
  updateTaskSchema,
} from "../middlewares/validators.js";

const router = express.Router();

router.post("/login", validate(loginSchema), login);
router.post("/job-seekers", validate(jobSeekerSchema), createJobSeeker);
router.get("/jobs", getJobs);

router.post("/logout", authenticate, logout);

router.get("/users", authenticate, authorize(["manage_users"]), getUsers);
router.get("/users/me", authenticate, getUserProfile);
router.put(
  "/users/:id/status",
  authenticate,
  validate(userStatusSchema),
  updateUserStatus
);

router.get("/tasks", authenticate, getTasks);
router.post(
  "/tasks",
  authenticate,
  authorize(["manage_tasks"]),
  validate(taskSchema),
  createTask
);
router.put("/tasks/:id", authenticate, validate(updateTaskSchema), updateTask);

router.post(
  "/jobs",
  authenticate,
  authorize(["manage_jobs"]),
  validate(jobSchema),
  createJob
);
router.get(
  "/jobs/:jobId/applicants",
  authenticate,
  authorize(["review_applicants"]),
  getJobSeekersByJobId
);

router.get(
  "/job-seekers",
  authenticate,
  authorize(["review_applicants"]),
  getJobSeekers
);

router.get(
  "/reports/dashboard",
  authenticate,
  authorize(["view_reports"]),
  getDashboard
);

export default router;
