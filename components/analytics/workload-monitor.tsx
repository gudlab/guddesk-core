"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AgentAvailabilityIndicator } from "@/components/inbox/agent-availability-indicator";
import { useAgentPresence } from "@/hooks/use-agent-presence";

interface MemberWorkload {
  memberId: string;
  userId: string;
  name: string;
  image: string | null;
  availability: "ONLINE" | "AWAY" | "OFFLINE";
  activeConversations: number;
  currentViewingId: string | null;
}

interface WorkloadMonitorProps {
  workspaceId: string;
  members: MemberWorkload[];
}

export function WorkloadMonitor({ workspaceId, members }: WorkloadMonitorProps) {
  const { getAvailability } = useAgentPresence(workspaceId, members);

  // Sort: online first, then away, then offline; within same status, sort by active conversations desc
  const sorted = [...members].sort((a, b) => {
    const statusOrder = { ONLINE: 0, AWAY: 1, OFFLINE: 2 };
    const aStatus = getAvailability(a.userId, a.availability);
    const bStatus = getAvailability(b.userId, b.availability);
    const orderDiff = statusOrder[aStatus] - statusOrder[bStatus];
    if (orderDiff !== 0) return orderDiff;
    return b.activeConversations - a.activeConversations;
  });

  const totalActive = members.reduce((sum, m) => sum + m.activeConversations, 0);
  const onlineCount = members.filter(
    (m) => getAvailability(m.userId, m.availability) === "ONLINE",
  ).length;
  const avgLoad = members.length > 0 ? Math.round(totalActive / members.length) : 0;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Agents Online
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {onlineCount}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                / {members.length}
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Active Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalActive}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg per Agent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{avgLoad}</p>
          </CardContent>
        </Card>
      </div>

      {/* Agent grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sorted.map((member) => {
          const liveStatus = getAvailability(member.userId, member.availability);
          const initials = member.name.slice(0, 2).toUpperCase();
          const loadLevel =
            member.activeConversations > 10
              ? "high"
              : member.activeConversations > 5
                ? "medium"
                : "low";

          return (
            <Card key={member.memberId}>
              <CardContent className="flex items-start gap-3 p-4">
                <div className="relative">
                  <Avatar className="size-10">
                    {member.image && <AvatarImage src={member.image} />}
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5">
                    <AgentAvailabilityIndicator availability={liveStatus} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {liveStatus.toLowerCase()}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-lg font-bold">{member.activeConversations}</span>
                    <span className="text-xs text-muted-foreground">active</span>
                    {loadLevel === "high" && (
                      <Badge variant="destructive" className="ml-auto text-[10px] px-1.5 py-0">
                        High Load
                      </Badge>
                    )}
                    {loadLevel === "medium" && (
                      <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
                        Moderate
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {members.length === 0 && (
          <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
            No team members found.
          </div>
        )}
      </div>
    </div>
  );
}
