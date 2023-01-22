import { createContext } from "react";
import { useState } from "react";

export const Chatcontext = createContext<any>({});

export default function ChatProvider({ children }: any) {
  const [chats, setChats] = useState<any[]>([]);

  return (
    <Chatcontext.Provider value={{ chats, setChats }}>
      {children}
    </Chatcontext.Provider>
  );
}
