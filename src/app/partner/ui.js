"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      className="btn btn-ghost !py-2 text-[13px]"
      onClick={async () => { await fetch("/api/partner/logout", { method: "POST" }); router.push("/partner/login"); }}
    >
      Log out
    </button>
  );
}

export function CopyLink({ link }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <code className="min-w-0 flex-1 overflow-x-auto rounded-2xl bg-sand px-4 py-3 text-[13px]">{link}</code>
      <button
        className="btn btn-dark !px-4 !py-2.5 text-[13px]"
        onClick={() => { navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      >
        {copied ? "Copied ✓" : "Copy"}
      </button>
    </div>
  );
}
