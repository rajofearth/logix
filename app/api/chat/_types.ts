export type ChatMessageDTO = {
  id: string;
  threadId: string;
  senderType: "admin" | "driver";
  content: string;
  createdAt: string; // ISO
};

export type ChatThreadDTO = {
  id: string;
  jobId: string;
  jobTitle: string;
  driver: {
    id: string;
    name: string;
    photoUrl: string | null;
    status: "available" | "on_route" | "off_duty";
  };
  lastMessage: ChatMessageDTO | null;
};


