"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { type CoreMessage } from "ai";
import { BsNvidia } from "react-icons/bs";
import ChatInput from "./chat-input";
import { readStreamableValue } from "ai/rsc";
import { FaUserAstronaut } from "react-icons/fa6";
import { IoLogoVercel } from "react-icons/io5";
import { continueConversation } from "../app/actions";
import { toast } from "sonner";
import remarkGfm from "remark-gfm";
import { MemoizedReactMarkdown } from "./markdown";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export default function Chat() {
  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("google/gemma-2-9b-it");
  const messageEndRef = useRef<HTMLDivElement>(null);

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    setMessages([]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim().length === 0) return;

    const newMessages: CoreMessage[] = [
      ...messages,
      { content: input, role: "user" },
    ];

    const newMessage: CoreMessage[] = [
      { content: input, role: "user" },
    ];

    setMessages(newMessages);
    setInput("");

    try {
      const result = await continueConversation(newMessage);

      for await (const content of readStreamableValue(result)) {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: content as string,
          },
        ]);
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="stretch mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-4 pb-[8rem] pt-[6rem] md:px-0 md:pt-[4rem] xl:pt-[2rem]">
        <h1 className="text-center text-5xl font-medium tracking-tighter">
          Welcome to InnoPlan Chatbot!
        </h1>

        <div className="mt-6 flex items-center justify-center gap-4">
          <span className="text-6xl">🤖</span>
        </div>

        <div className="mt-6 px-3 md:px-0">
          <h2 className="text-base font-medium text-center">
            Ready to turn your ideas into action? 🚀
          </h2>
          <p className="mt-4 text-center text-sm text-primary/80">
            InnoPlan Chatbot helps you generate detailed business plans, pitch scripts, and task assignments based on your startup idea. Simply provide your idea, and let the chatbot guide you through the planning process!
          </p>
          <p className="mt-4 text-center text-sm text-primary/80">
            Enter your idea or question to get started!
          </p>
        </div>
        <ChatInput
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
        />
      </div>
    );
  }

  return (
    <div className="stretch mx-auto w-full max-w-2xl px-4 py-[8rem] pt-24 md:px-0">
      {messages.map((m, i) => (
        <div key={i} className="mb-4 flex items-start p-2">
          <div
            className={cn(
              "flex size-8 shrink-0 select-none items-center justify-center rounded-lg",
              m.role === "user"
                ? "border bg-background"
                : "bg-nvidia border border-[#628f10] text-primary-foreground",
            )}>
            {m.role === "user" ? <FaUserAstronaut /> : <BsNvidia />}
          </div>
          <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
            <MemoizedReactMarkdown
              remarkPlugins={[remarkGfm]}
              className="prose prose-sm break-words dark:prose-invert prose-pre:rounded-lg prose-pre:bg-zinc-100 prose-pre:p-4 prose-pre:text-zinc-900 dark:prose-pre:bg-zinc-900 dark:prose-pre:text-zinc-100">
              {m.content as string}
            </MemoizedReactMarkdown>
          </div>
        </div>
      ))}
      <div ref={messageEndRef} />
      <ChatInput
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}