import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-semibold mb-2">Welcome to Chat</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Select a chat from the sidebar or create a new one to get started.
      </p>
    </div>
  );
}