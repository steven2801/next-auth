// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import prisma from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      const movies = await prisma.movie.findMany();

      res.status(200).json({ movies });
      break;

    case "PUT":
      const { id, seats } = req.body;
      await prisma.movie.update({
        data: {
          seats,
        },
        where: {
          id,
        },
      });
      res.status(200).json("Ticket purchase successful!");
      break;
  }
}
