import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Gift, TrendingUp, Users, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const features = [
  {
    icon: TrendingUp,
    title: "Watch & Earn",
    desc: "Earn points for every ad you watch",
  },
  {
    icon: Gift,
    title: "Redeem Rewards",
    desc: "Exchange points for gift cards or cash",
  },
  {
    icon: Users,
    title: "Compete",
    desc: "Climb the leaderboard and win bonuses",
  },
];

export function LoginPage() {
  const { login, isLoggingIn, isLoginSuccess } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoginSuccess) {
      navigate({ to: "/dashboard" });
    }
  }, [isLoginSuccess, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card rounded-2xl shadow-card border border-border p-8"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AdEarn</h1>
              <p className="text-xs text-muted-foreground">
                Earn while you watch
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">
            Welcome back
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            Sign in to start earning points by watching ads.
          </p>

          {/* Features */}
          <div className="space-y-3 mb-8">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {title}
                  </p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={() => login()}
            disabled={isLoggingIn}
            className="w-full h-11 font-semibold text-base"
            data-ocid="login.primary_button"
          >
            {isLoggingIn ? "Connecting..." : "Sign In"}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Secured by Internet Identity · No passwords required
          </p>
        </motion.div>
      </div>
    </div>
  );
}
