import { nanoid } from "nanoid";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Socket } from "socket.io";
import { io } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

type ChatLog = {
  id: number;
  message: string;
  username: string;
};

const ChatRoom = () => {
  const [userName, setUserName] = useState<string>("익명");
  const [inputValue, setInputValue] = useState<string>("");
  const router = useRouter();
  const { roomNum } = router.query;
  const [chatLogs, setChatLogs] = React.useState<ChatLog[]>([
    { id: 1, message: "채팅방에 오신 것을 환영합니다", username: "운영자" },
  ]);

  const [socket, setSocket] = React.useState<Socket<DefaultEventsMap> | null>(
    null
  );

  useEffect(() => {
    router.isReady;
  }, []);

  useEffect(() => {
    if (router.isReady == false) return;
    // connect socket.io
    const connectToSocket = async () => {
      await fetch("/api/chat");
      const socket = io();

      setSocket(socket as any);

      socket.on("connect", () => {
        socket.emit("roomEnter", roomNum);
      });

      socket.on("chat", (chatLog: any) => {
        if (chatLog.roomNum !== roomNum) return;
        setChatLogs((prev) => [...prev, chatLog]);
      });
    };

    connectToSocket();

    return () => {
      socket?.disconnect();
    };
  }, [router.isReady]);

  const sendChat = (e: React.KeyboardEvent<EventTarget>) => {
    if (e.key !== "Enter") return;

    const chatLog = {
      id: nanoid(),
      message: (e.target as any).value,
      username: userName,
      roomNum,
    };

    socket?.emit("chat", chatLog);
    setInputValue("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div>
      <h2>ChatRoom</h2>
      <h1>{roomNum}방입니다.</h1>
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

export default ChatRoom;
