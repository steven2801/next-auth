import { useEffect, useMemo, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import Head from "next/head";
import { useSearchParams } from "next/navigation";
import { LucideLoader2 } from "lucide-react";
import { useRouter } from "next/router";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";
import { GetServerSidePropsContext } from "next";

const popupCenter = (url: string, title: string) => {
  const dualScreenLeft = window.screenLeft ?? window.screenX;
  const dualScreenTop = window.screenTop ?? window.screenY;

  const width = window.innerWidth ?? document.documentElement.clientWidth ?? screen.width;

  const height = window.innerHeight ?? document.documentElement.clientHeight ?? screen.height;

  const systemZoom = width / window.screen.availWidth;

  const left = (width - 500) / 2 / systemZoom + dualScreenLeft;
  const top = (height - 550) / 2 / systemZoom + dualScreenTop;

  const newWindow = window.open(
    url,
    title,
    `width=${500 / systemZoom},height=${550 / systemZoom},top=${top},left=${left}`
  );

  newWindow?.focus();
};

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { data, update } = useSession();

  const searchParams = useSearchParams();

  const error = useMemo(() => searchParams.get("error"), [searchParams]);
  const success = useMemo(() => searchParams.get("success"), [searchParams]);

  const router = useRouter();

  useEffect(() => {
    if (error) {
      if (error === "same-email") {
        toast.error("Account with the same email already exists.");
      } else if (error === "invalid-credentials") {
        toast.error("Wrong username or password.");
      }
      router.replace("/", undefined, { shallow: true });
    }
    if (success) {
      if (success === "true") {
        toast.success("Successfully logged in!");
      }
      router.replace("/", undefined, { shallow: true });
    }
  }, [error, router, success]);

  const [credentialsLoading, setCredentialsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [notionLoading, setNotionLoading] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <div className="container mx-auto">
        <div className="grid place-items-center h-screen">
          <div className="p-4 w-80 mx-auto">
            <h1 className="text-center font-bold text-xl">Next Auth Demo - Login</h1>
            <p>{data?.user.balance}</p>
            <button
              onClick={async () => {
                await update({
                  user: {
                    balance: 20000,
                  },
                });
              }}
            >
              add balance
            </button>
            {data && (
              <div className="mt-4 border rounded-md shadow px-2 py-8">
                <p className="text-center">{data?.user?.email}</p>
              </div>
            )}
            {data && (
              <button
                onClick={async () => {
                  try {
                    setSignOutLoading(true);
                    await new Promise((resolve) => setTimeout(resolve, 500)).then(() => {
                      signOut({ redirect: false });
                      toast.success("See you again!");
                    });
                  } catch (err) {
                    toast.error("Something went wrong.");
                  } finally {
                    setSignOutLoading(false);
                  }
                }}
                disabled={signOutLoading}
                className="mt-4 p-2 w-full bg-red-500 text-white rounded-md shadow group relative disabled:opacity-50 disabled:text-transparent"
              >
                <div className="absolute inset-0 text-white opacity-0 animate-spin grid place-items-center group-disabled:opacity-100">
                  <LucideLoader2 className="w-4 h-4" strokeWidth={2} />
                </div>
                Sign Out
              </button>
            )}
            {!data && (
              <div className="divide-y-2 space-y-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setCredentialsLoading(true);

                    signIn("credentials", {
                      email,
                      password,
                      redirect: false,
                    })
                      .then((res) => {
                        if (res?.ok) {
                          setEmail("");
                          setPassword("");
                          toast.success("Successfully logged in!");
                        }

                        if (res?.error) {
                          toast.error("Wrong username or password.");
                        }
                      })
                      .finally(() => {
                        setCredentialsLoading(false);
                      });
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
                  <button
                    disabled={credentialsLoading}
                    type="submit"
                    className="p-2 bg-indigo-500 text-white rounded-md shadow group relative disabled:text-transparent disabled:opacity-50"
                  >
                    <div className="absolute inset-0 text-white opacity-0 animate-spin grid place-items-center group-disabled:opacity-100">
                      <LucideLoader2 className="w-4 h-4" strokeWidth={2} />
                    </div>
                    Login
                  </button>
                  <Link href="/register" className="text-blue-600 hover:underline active:underline text-center py-2">
                    No Account Yet?
                  </Link>
                </form>
                <div className="pt-4 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setNotionLoading(true);
                      signIn("notion", { callbackUrl: "/?success=true" });
                    }}
                    disabled={notionLoading}
                    className="relative group p-2 overflow-hidden w-full bg-zinc-600 text-white rounded-md shadow disabled:text-transparent disabled:opacity-50"
                  >
                    <div className="absolute inset-0 text-white opacity-0 animate-spin grid place-items-center group-disabled:opacity-100">
                      <LucideLoader2 className="w-4 h-4" strokeWidth={2} />
                    </div>
                    Notion
                  </button>
                  <button
                    onClick={() => {
                      setGoogleLoading(true);
                      signIn("google", { callbackUrl: "/?success=true" });
                    }}
                    disabled={googleLoading}
                    className="relative group p-2 overflow-hidden w-full bg-purple-500 text-white rounded-md shadow disabled:text-transparent disabled:opacity-50"
                  >
                    <div className="absolute inset-0 text-white opacity-0 animate-spin grid place-items-center group-disabled:opacity-100">
                      <LucideLoader2 className="w-4 h-4" strokeWidth={2} />
                    </div>
                    Google
                  </button>
                  <button
                    onClick={() => {
                      setGithubLoading(true);
                      signIn("github", { callbackUrl: "/?success=true" });
                    }}
                    disabled={githubLoading}
                    className="relative group p-2 overflow-hidden w-full bg-zinc-600 text-white rounded-md shadow disabled:text-transparent disabled:opacity-50"
                  >
                    <div className="absolute inset-0 text-white opacity-0 animate-spin grid place-items-center group-disabled:opacity-100">
                      <LucideLoader2 className="w-4 h-4" strokeWidth={2} />
                    </div>
                    Github
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  return {
    props: {
      session,
    },
  };
}
