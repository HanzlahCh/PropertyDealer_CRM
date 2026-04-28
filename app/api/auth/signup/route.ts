import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/app/_lib/db";
import User from "@/models/User";
import { SignupFormSchema } from "@/app/_lib/definitions";
import { createSession } from "@/app/_lib/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validate
    const parsed = SignupFormSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parsed.data;

    // 2. Connect to DB
    await dbConnect();

    // 3. Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json(
        { message: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "agent",
    });

    // 6. Create session
    await createSession(String(user._id), user.role);

    return Response.json(
      {
        message: "Account created successfully",
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
