import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function UpgradeCard() {
  return (
    <Card className="md:max-xl:rounded-none md:max-xl:border-none md:max-xl:shadow-none">
      <CardHeader className="md:max-xl:px-4">
        <CardTitle>Upgrade to Pro</CardTitle>
        <CardDescription>
          Pro is $29 a month for the whole workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="md:max-xl:px-4">
        <Link href="/dashboard/billing">
          <Button size="sm" className="w-full">
            Go to billing
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
