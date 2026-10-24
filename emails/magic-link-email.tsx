import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type MagicLinkEmailProps = {
  actionUrl: string;
  firstName: string;
  mailType: "login" | "register";
  siteName: string;
};

const brandColor = "#3ECF8E";

export const MagicLinkEmail = ({
  firstName = "",
  actionUrl,
  mailType,
  siteName,
}: MagicLinkEmailProps) => (
  <Html>
    <Head />
    <Preview>
      {mailType === "login"
        ? `Sign in to ${siteName}`
        : `Activate your ${siteName} account`}
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
            <Text className="text-base text-gray-800">
              Hi{firstName ? ` ${firstName}` : ""},
            </Text>
            <Text className="text-base leading-6 text-gray-600">
              {mailType === "login"
                ? `Click the button below to sign in to your ${siteName} account.`
                : `Welcome to ${siteName}! Click the button below to activate your account.`}
            </Text>
            <Section className="my-6 text-center">
              <Button
                className="inline-block rounded-lg px-6 py-3 text-base font-semibold text-white no-underline"
                href={actionUrl}
                style={{ backgroundColor: brandColor }}
              >
                {mailType === "login" ? "Sign in" : "Activate Account"}
              </Button>
            </Section>
            <Text className="text-sm leading-5 text-gray-500">
              This link expires in 24 hours and can only be used once.
            </Text>
            {mailType === "login" ? (
              <Text className="text-sm leading-5 text-gray-500">
                If you did not try to log into your account, you can safely
                ignore this email.
              </Text>
            ) : null}
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

export default MagicLinkEmail;
