import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import AdComponent from "@/components/Ad";
import { AD_SLOTS } from "@/config/adSlots";
import Layout from "@/components/Layout";
import { useAccessControl } from "@/hooks/useAccessControl";

const Ad = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const returnPath = params.get('return') || '/';
  const { accessLevel } = useAccessControl();
  const isPaidUser = accessLevel === "paid";

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate(returnPath)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>

          <div className="bg-card rounded-lg border p-6 mb-6">
            <h1 className="text-2xl font-bold mb-4">Support Our Platform</h1>
            <p className="text-muted-foreground mb-4">
              View these ads to help us keep ReBooked Living free for students.
            </p>
          </div>

          <div className="space-y-6">
            <AdComponent adSlot={AD_SLOTS.rewardedSlot1} isPaidUser={isPaidUser} className="min-h-[250px]" />
            <AdComponent adSlot={AD_SLOTS.rewardedSlot2} isPaidUser={isPaidUser} className="min-h-[250px]" />
            <AdComponent adSlot={AD_SLOTS.rewardedSlot3} isPaidUser={isPaidUser} className="min-h-[250px]" />
          </div>

          <div className="mt-6 text-center">
            <Button onClick={() => navigate(returnPath)}>
              Continue to Content
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Ad;
