import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/app/_lib/db";
import User from "@/models/User";
import { LoginFormSchema } from "@/app/_lib/definitions";
import { createSession } from "@/app/_lib/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validate
    const parsed = LoginFormSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // 2. Connect to DB
    await dbConnect();

    // 3. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return Response.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 4. Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return Response.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 5. Create session
    await createSession(String(user._id), user.role);

    return Response.json({
      message: "Logged in successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
