"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/lib/actions/profile";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const [value, setValue] = React.useState(name);
  const [pending, start] = React.useTransition();

  function save() {
    start(async () => {
      const r = await updateProfile({ fullName: value });
      if (r.ok) {
        toast.success("Profile updated");
        router.refresh();
      } else toast.error(r.error);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="full-name">Full name</Label>
        <Input
          id="full-name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Your name"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled />
      </div>
      <div>
        <Button
          onClick={save}
          disabled={pending || value.trim() === name.trim()}
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}
