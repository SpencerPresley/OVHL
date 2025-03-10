import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

/**
 * Props for the ResetPasswordEmail component
 * @interface ResetPasswordEmailProps
 * @property {string} resetLink - The URL for password reset with token
 */
interface ResetPasswordEmailProps {
  resetLink: string;
}

/**
 * React Email template for password reset emails
 *
 * @component
 * @param {ResetPasswordEmailProps} props - Component props
 * @param {string} props.resetLink - The password reset link with token
 * @returns {JSX.Element} Email template with reset link
 *
 * Features:
 * - Responsive design
 * - Accessible HTML structure
 * - Preview text for email clients
 * - Fallback styles for email clients
 * - Clear call-to-action button
 *
 * @example
 * ```tsx
 * <ResetPasswordEmail resetLink="https://example.com/reset?token=123" />
 * ```
 */
export default function ResetPasswordEmail({ resetLink }: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password for WOC League</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Reset your password</Heading>
          <Text style={text}>
            We received a request to reset your password for your WOC League account. Click the
            button below to set a new password:
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={resetLink}>
              Reset Password
            </Button>
          </Section>
          <Text style={text}>
            If you didn&apos;t request this password reset\, you can safely ignore this email. The
            link will expire in 24 hours.
          </Text>
          <Text style={footer}>This is an automated email&apos; please do not reply.</Text>
        </Container>
      </Body>
    </Html>
  );
}

/**
 * Email-safe styles for the main body
 * @constant
 */
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

/**
 * Email-safe styles for the container
 * @constant
 */
const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

/**
 * Email-safe styles for the heading
 * @constant
 */
const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
};

/**
 * Email-safe styles for text content
 * @constant
 */
const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

/**
 * Email-safe styles for the button container
 * @constant
 */
const buttonContainer = {
  margin: '24px 0',
};

/**
 * Email-safe styles for the button
 * @constant
 */
const button = {
  backgroundColor: '#0070f3',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 20px',
};

/**
 * Email-safe styles for the footer
 * @constant
 */
const footer = {
  color: '#666',
  fontSize: '14px',
  margin: '32px 0 0',
};
