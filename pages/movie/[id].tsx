import axios from "axios";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import React from "react";
import { LucideLoader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";
import prisma from "@/lib/prisma";

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const data = await prisma.movie.findMany();

  const movies = data.find((movie) => movie.id === Number(ctx.params?.id));

  if (!movies) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      data: movies,
    },
  };
}

export default function Movie({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [num, setNum] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);

  const [seats, setSeats] = React.useState(data.seats);

  const selectedSeatsFromApi = data.seats.filter((seat) => seat === 1).length;
  const selectedUserSeats = seats.filter((seat) => seat === 1).length;
  const maxSeats = num + selectedSeatsFromApi;

  const router = useRouter();

  const refreshData = () => {
    router.replace(router.asPath);
    setNum(1);
  };

  return (
    <div className="container p-4 mx-auto scrollbar">
      <div className="grid place-items-center">
        <div className="p-10 sm:p-20 border shadow w-fit">
          <div className="space-y-4 divide-y-2">
            <form
              onSubmit={async (e) => {
                e.preventDefault();

                if (selectedUserSeats - selectedSeatsFromApi < num) {
                  const diff = maxSeats - selectedUserSeats;
                  toast.error(`Please select ${diff} more seats.`);
                  return;
                }

                setIsLoading(true);

                const { data: message } = await axios.put("http://localhost:3000/api/movies", {
                  id: data.id,
                  seats,
                });

                await new Promise((resolve) => setTimeout(resolve, 500));
                toast.success(message);
                setIsLoading(false);
                refreshData();
              }}
            >
              <p className="text-xl font-bold">{data.title}</p>
              <p className="text-lg mt-2">Price: Rp. {data.ticketPrice}</p>

              <fieldset disabled={isLoading} className="group">
                <div className="max-sm:mt-4 flex max-sm:flex-col sm:justify-between sm:items-end sm:gap-4">
                  <input
                    required
                    name="number"
                    id="number"
                    type="number"
                    min={1}
                    max={6}
                    placeholder="Enter number of tickets"
                    className="border shadow py-2 text-center mt-4"
                    value={num.toString()}
                    onChange={(e) => setNum(Number(e.target.value))}
                  />
                  <label htmlFor="number" className="text-gray-500 mt-2 inline-block">
                    Choose 1 - 6 tickets
                  </label>
                </div>

                <div className="p-4 border bg-gray-100 rounded shadow mt-4">
                  <p className="text-center ">Screen</p>
                </div>
                <div className="grid grid-cols-8 gap-4 my-4 mx-auto w-fit group-disabled:opacity-50 duration-200">
                  {seats.map((item, i) => {
                    const isTaken = data.seats[i] === 1;
                    return (
                      <button
                        type="button"
                        key={i}
                        onClick={() => {
                          if (selectedUserSeats === maxSeats && item === 0) {
                            toast.error(`You can only buy ${num} tickets`);
                            return;
                          }
                          setSeats((prev) => {
                            const newArr = Array.from(prev);
                            newArr[i] = newArr[i] === 0 ? 1 : 0;
                            return newArr;
                          });
                        }}
                        disabled={data.seats[i] === 1}
                        className={`w-8 h-8 rounded shadow flex items-center justify-center ${
                          item === 0 ? "bg-red-200 shadow-red-300" : "bg-green-300 shadow-green-400"
                        } ${selectedUserSeats === maxSeats && item === 0 && "cursor-not-allowed"} ${
                          isTaken && "bg-yellow-400 shadow-yellow-500 cursor-not-allowed"
                        }`}
                      >
                        <p className="text-sm">{i + 1}</p>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="submit"
                  className="mt-8 sm:mt-4 px-3 py-2 w-full shadow-emerald-200 rounded bg-emerald-800 active:bg-emerald-700 duration-200 text-white shadow relative group-disabled:text-transparent group-disabled:opacity-80"
                >
                  <div className="absolute inset-0 text-white grid place-items-center group-disabled:opacity-100 opacity-0">
                    <LucideLoader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                  </div>
                  Buy Tickets
                </button>
              </fieldset>
            </form>
            <div className="pt-8 sm:pt-4 text-center">
              <p>Total: Rp. {num * data.ticketPrice}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
