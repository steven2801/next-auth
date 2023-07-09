import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import Head from "next/head";
import axios from "axios";
import { LucideLoader2 } from "lucide-react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  return (
    <>
      <Head>
        <title>Register</title>
      </Head>
      <div className="container mx-auto">
        <div className="grid place-items-center h-screen">
          <div className="p-4 w-80 mx-auto">
            <h1 className="text-center font-bold text-xl">Next Auth Demo - Register</h1>

            <div className="divide-y-2 space-y-4">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsLoading(true);

                  if (password !== password2) {
                    toast.error("Passwords do not match.");
                    return;
                  }

                  try {
                    await axios.post("/api/register", { email, password });
                    signIn("credentials", {
                      email,
                      password,
                      callbackUrl: "/?success=true",
                    });
                  } catch (err: any) {
                    console.log(err);
                    if (axios.isAxiosError(err)) {
                      const errorMessage = err?.response?.data.message ?? "An Error Occurred.";
                      toast.error(errorMessage);
                    } else {
                      console.log(err);
                    }
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="flex flex-col gap-4 mt-4"
              >
                <input
                  className="py-2 px-3 border rounded shadow"
                  type="text"
                  value={email}
                  placeholder="Email"
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  className="py-2 px-3 border rounded shadow"
                  type="password"
                  value={password}
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <input
                  className="py-2 px-3 border rounded shadow"
                  type="password"
                  value={password2}
                  placeholder="Confirm Password"
                  onChange={(e) => setPassword2(e.target.value)}
                />
                <button
                  disabled={isLoading}
                  type="submit"
                  className="p-2 bg-indigo-500 text-white rounded-md shadow group relative disabled:text-transparent disabled:opacity-50"
                >
                  <div className="absolute inset-0 text-white opacity-0 animate-spin grid place-items-center group-disabled:opacity-100">
                    <LucideLoader2 className="w-4 h-4" strokeWidth={2} />
                  </div>
                  Create Account
                </button>
                <Link href="/" className="text-blue-600 hover:underline active:underline py-2 text-center">
                  Already have an account?
                </Link>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
