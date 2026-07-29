import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  create: vi.fn(),
  hash: vi.fn(),
}));

vi.mock("@/app/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mocks.findUnique,
      create: mocks.create,
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: mocks.hash,
  },
}));

import { register } from "@/app/features/auth/services/register.service";
import { ConflictError } from "@/app/lib/errors/ConflictError";

describe("register service", () => {
  beforeEach(() => {
    vi.stubEnv("HASHING_SALT", "10");
    mocks.findUnique.mockResolvedValue(null);
    mocks.create.mockResolvedValue({ id: "user-1" });
    mocks.hash.mockResolvedValue("hashed-password");
  });

  it("normalizes identity fields, hashes the password, and creates the user", async () => {
    const result = await register({
      username: "  Mohamed_Dev  ",
      email: "  MOHAMED@EXAMPLE.COM  ",
      password: "Test12345",
    });

    expect(mocks.findUnique).toHaveBeenCalledTimes(2);
    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: { email: "mohamed@example.com" },
    });
    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: { username: "mohamed_dev" },
    });
    expect(mocks.hash).toHaveBeenCalledWith("Test12345", 10);
    expect(mocks.create).toHaveBeenCalledWith({
      data: {
        email: "mohamed@example.com",
        username: "mohamed_dev",
        passwordHash: "hashed-password",
        displayName: "Mohamed_Dev",
      },
    });
    expect(result).toEqual({
      success: true,
      message: "Account created successfully.",
    });
  });

  it("maps an existing email conflict to the email field", async () => {
    mocks.findUnique
      .mockResolvedValueOnce({ id: "existing-user" })
      .mockResolvedValueOnce(null);

    const error = await register({
      username: "new_user",
      email: "existing@example.com",
      password: "Test12345",
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ConflictError);
    expect((error as ConflictError).errors).toEqual({
      email: "Email already exists.",
    });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("maps an existing username conflict to the username field", async () => {
    mocks.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "existing-user" });

    const error = await register({
      username: "existing_user",
      email: "new@example.com",
      password: "Test12345",
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ConflictError);
    expect((error as ConflictError).errors).toEqual({
      username: "Username already exists.",
    });
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
