// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import prisma from "@/lib/prisma";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { data } = await axios.get("https://seleksi-sea-2023.vercel.app/api/movies");

  // id, title, ageRating, seats, ticketPrice

  const movies = data.map((d: any) => ({
    id: d.id,
    title: d.title,
    ageRating: d.age_rating,
    seats: Array.from({ length: 64 }, (_) => 0),
    ticketPrice: d.ticket_price,
  }));

  await prisma.movie.deleteMany({});

  await prisma.movie.createMany({
    data: [...movies],
    skipDuplicates: true,
  });

  res.status(200).json({ data });
}
