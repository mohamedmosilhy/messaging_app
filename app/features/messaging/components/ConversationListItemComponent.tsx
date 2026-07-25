import React from "react";
import { ConversationListItem } from "../types/conversation.types";
import Link from "next/link";
import Image from "next/image";

const ConversationListItemComponent = ({
  conversation,
}: {
  conversation: ConversationListItem;
}) => {
  return (
    <Link
      className="m-2"
      href={`/dashboard/conversations/${conversation.conversationId}`}
    >
      <li
        key={conversation.conversationId}
        className="p-4 bg-white rounded-lg shadow-md"
      >
        <div className="font-semibold">{conversation.title}</div>
        <Image
          src={conversation.avatarUrl || "https://i.pravatar.cc/300?img=1"}
          className="rounded-full"
          alt="Avatar"
          width={100}
          height={100}
        />
        <div className="text-gray-600">{conversation.lastMessage}</div>
        <div className="text-sm text-gray-500">
          {String(conversation.lastMessageAt)}
        </div>
      </li>
    </Link>
  );
};

export default ConversationListItemComponent;
