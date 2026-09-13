import { NextResponse } from "next/server";
import { getCurrentUser, getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await getCurrentUser();
    if (!user) {
      const res = NextResponse.json({ user: null, error: "User not found" }, { status: 401 });
      res.cookies.set("dayflow_token", "", { maxAge: 0, path: "/" });
      return res;
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Auth Me API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
