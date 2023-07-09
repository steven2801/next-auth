// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "POST":
      const { email, password } = req.body;

      const hashedPassword = await bcrypt.hash(password, 12);

      const userWithSameEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (userWithSameEmail) {
        res.status(400).json({ message: "User with same email already exists" });
      }

      const createUserFn = prisma.user.create({
        data: {
          email,
          name: "yeah",
          hashedPassword,
        },
      });

      const createAccountFn = prisma.account.create({
        data: {
          provider: "credentials",
          providerAccountId: email,
          type: "email",
          user: {
            connect: {
              email,
            },
          },
        },
      });

      const user = await createUserFn;
      const _ = await createAccountFn;

      res.status(200).json({ user });
      break;
  }
}
