import SignIn from "@/components/auth/sign-in";

type SignInPageProps = {
  searchParams?: Promise<{
    from?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const sp = await searchParams;
  return <SignIn from={sp?.from} />;
}


