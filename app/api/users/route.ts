import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req:any, res:any) {
    console.log("hello")
  if (req.method === "GET") {
    // GET 请求，获取所有用户
    try {
      const users = await prisma.user.findMany();
      console.log(users,'users');
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: "Error fetching users" });
    }
  } else if (req.method === "POST") {
    // POST 请求，创建新用户
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }
    try {
      const user = await prisma.user.create({
        data: {
          name,
          email,
        },
      });
      console.log(user, "user");

      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: "Error creating user" });
    }
  } else {
    // 处理不支持的请求方法
    res.status(405).json({ error: "Method not allowed" });
  }
}
