import SignIn from "@/components/auth/sign-in";

type SignInPageProps = {
  searchParams?: {
    from?: string;
  };
};

export default function SignInPage({ searchParams }: SignInPageProps) {
  return <SignIn from={searchParams?.from} />;
}


