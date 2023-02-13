import { createContext } from "react";
import { useState } from "react";
import { Message } from "../../components/Interface/index";

export const Chatcontext = createContext<any>({});

export default function ChatProvider({ children }: { children: JSX.Element }) {
  const [chats, setChats] = useState<Message[]>([]);

  return (
    <Chatcontext.Provider value={{ chats, setChats }}>
      {children}
    </Chatcontext.Provider>
  );
}
