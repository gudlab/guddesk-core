import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type WorkspaceInvitationEmailProps = {
  inviterName: string;
  workspaceName: string;
  role: string;
  actionUrl: string;
};

const brandColor = "#3ECF8E";

export const WorkspaceInvitationEmail = ({
  inviterName = "Someone",
  workspaceName = "a workspace",
  role = "Agent",
  actionUrl,
}: WorkspaceInvitationEmailProps) => (
  <Html>
    <Head />
    <Preview>
      You&apos;ve been invited to join {workspaceName} on GudDesk
    </Preview>
    <Tailwind>
      <Body className="bg-gray-50 font-sans">
        <Container className="mx-auto max-w-md py-8 pb-12">
          {/* Header with brand color bar */}
          <Section
            className="rounded-t-lg px-8 py-6 text-center"
            style={{ backgroundColor: brandColor }}
          >
            <Text className="m-0 text-xl font-bold text-white">GudDesk</Text>
          </Section>

          {/* Content */}
          <Section className="rounded-b-lg border border-t-0 border-gray-200 bg-white px-8 py-6">
            <Text className="text-base text-gray-800">Hi there,</Text>
            <Text className="text-base leading-6 text-gray-600">
              <strong className="text-gray-800">{inviterName}</strong> has
              invited you to join{" "}
              <strong className="text-gray-800">{workspaceName}</strong> as a{" "}
              {role} on GudDesk.
            </Text>
            <Section className="my-6 text-center">
              <Button
                className="inline-block rounded-lg px-6 py-3 text-base font-semibold text-white no-underline"
                href={actionUrl}
                style={{ backgroundColor: brandColor }}
              >
                Accept Invitation
              </Button>
            </Section>
            <Text className="text-sm leading-5 text-gray-500">
              This invitation expires in 7 days. If you don&apos;t have a
              GudDesk account, one will be created when you accept.
            </Text>
            <Text className="text-sm leading-5 text-gray-500">
              If you weren&apos;t expecting this invitation, you can safely
              ignore this email.
            </Text>
          </Section>

          {/* Footer */}
          <Text className="mt-6 text-center text-xs text-gray-400">
            GudDesk, the open-source customer messaging platform
          </Text>
          <Text className="mt-1 text-center text-xs text-gray-400">
            guddesk.com
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default WorkspaceInvitationEmail;
