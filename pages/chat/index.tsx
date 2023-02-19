import React, { useEffect, useState } from "react";
import { Socket } from "socket.io";
import io from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { nanoid } from "nanoid";
import { useRouter } from "next/router";

type ChatLog = {
  id: number;
  message: string;
  username: string;
};

const Chat = () => {
  const router = useRouter();

  const [userName, setUserName] = useState<string>("익명");
  const [inputValue, setInputValue] = useState<string>("");
  const [chatLogs, setChatLogs] = React.useState<ChatLog[]>([
    { id: 1, message: "채팅방에 오신 것을 환영합니다", username: "운영자" },
  ]);
  const [socket, setSocket] = React.useState<Socket<DefaultEventsMap> | null>(
    null
  );

  useEffect(() => {
    // connect socket.io
    const connectToSocket = async () => {
      await fetch("/api/chat");
      const socket = io();

      setSocket(socket as any);

      socket.on("connect", () => {
        console.log("connected");
      });

      socket.on("chat", (chatLog: any) => {
        if (chatLog.roomNum) return;
        setChatLogs((prev) => [...prev, chatLog]);
      });
    };

    connectToSocket();

    return () => {
      socket?.disconnect();
    };
  }, []);

  const sendChat = (e: React.KeyboardEvent<EventTarget>) => {
    if (e.key !== "Enter") return;

    const chatLog = {
      id: nanoid(),
      message: (e.target as any).value,
      username: userName,
    };

    socket?.emit("chat", chatLog);
    setInputValue("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div>
      <div>채팅방들입니다.</div>
      <div
        onClick={() => {
          router.push("/chat/room/1");
        }}
      >
        1번 방
      </div>
      <div
        onClick={() => {
          router.push(`/chat/room/2`);
        }}
      >
        2번 방
      </div>

      <h2>ChatLogs</h2>
      <input
        value={userName}
        onChange={(e) => {
          setUserName(e.target.value);
        }}
      />
      <div>
        {chatLogs.map((chatLog) => (
          <div key={chatLog?.id}>
            <p>
              {chatLog?.username}: {chatLog?.message}
            </p>
          </div>
        ))}
      </div>
      <input
        type="text"
        onKeyPress={sendChat}
        value={inputValue}
        onChange={handleChange}
      />
    </div>
  );
};

export default Chat;
