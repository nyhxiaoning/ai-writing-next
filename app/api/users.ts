import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// GET 请求，获取所有用户
export async function GET() {
  try {
    console.log("Getting users...");
    const users = await prisma.user.findMany();
    console.log(users, 'users');
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: "Error fetching users" },
      { status: 500 }
    );
  }
}

// POST 请求，创建新用户
export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
      },
    });

    console.log(user, "user created");
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: "Error creating user" },
      { status: 500 }
    );
  }
}
