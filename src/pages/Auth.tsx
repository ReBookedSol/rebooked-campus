import { SignIn, SignUp, ClerkLoaded, ClerkLoading } from "@clerk/clerk-react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "signin";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[80vh]">
        <ClerkLoading>
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Initializing secure session...</p>
          </div>
        </ClerkLoading>
        
        <ClerkLoaded>
          {mode === "signup" ? (
            <SignUp signInUrl="/auth?mode=signin" forceRedirectUrl="/profile" />
          ) : (
            <SignIn signUpUrl="/auth?mode=signup" forceRedirectUrl="/profile" />
          )}
        </ClerkLoaded>
      </div>
    </Layout>
  );
};

export default Auth;
