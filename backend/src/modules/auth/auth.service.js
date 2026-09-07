import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';
import { signToken } from '../../utils/jwt.js';

const ALLOWED_ROLES = ['recruiter', 'interviewer'];

export const registerUser = async ({ name, email, password, role }) => {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new AppError('Name is required and cannot be empty.', 400);
  }

  if (!email || typeof email !== 'string' || email.trim() === '') {
    throw new AppError('Email is required and cannot be empty.', 400);
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    throw new AppError('Password is required and must be at least 6 characters long.', 400);
  }

  // Default to interviewer if role is omitted
  const assignedRole = role ? role.trim().toLowerCase() : 'interviewer';

  if (!ALLOWED_ROLES.includes(assignedRole)) {
    throw new AppError(`Invalid role '${role}'. Allowed roles are: ${ALLOWED_ROLES.join(', ')}.`, 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check duplicate email
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new AppError('Email is already registered. Please log in.', 409);
  }

  // Hash password using bcrypt - never store plaintext
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: assignedRole,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const token = signToken({ id: user.id, role: user.role });

  return { user, token };
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError('Please provide both email and password.', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError('Invalid email or password.', 401);
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  const token = signToken({ id: user.id, role: user.role });

  return { user: safeUser, token };
};