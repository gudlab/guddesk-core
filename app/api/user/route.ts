import { auth } from "@/auth";

import { prisma } from "@/lib/db";
import { unassignMemberConversations } from "@/lib/conversations/unassign-member";

export const DELETE = auth(async (req) => {
  if (!req.auth) {
    return new Response("Not authenticated", { status: 401 });
  }

  const currentUser = req.auth.user;
  if (!currentUser?.id) {
    return new Response("Invalid user", { status: 401 });
  }
  const userId = currentUser.id;

  try {
    // Their memberships go with the user; unassign their conversations
    // with unassignedAt = now first.
    await prisma.$transaction([
      prisma.conversation.updateMany(
        unassignMemberConversations({ userId }, new Date()),
      ),
      prisma.user.delete({
        where: {
          id: userId,
        },
      }),
    ]);
  } catch (error) {
    return new Response("Internal server error", { status: 500 });
  }

  return new Response("User deleted successfully!", { status: 200 });
});
