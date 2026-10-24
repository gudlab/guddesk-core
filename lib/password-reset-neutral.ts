/**
 * What forgot-password says after a request, whether or not the account
 * exists and whether or not the email went out. It never says the email
 * was sent, so a failed send can't mislead, and it can't be used to find
 * out which emails have accounts.
 */
export const PASSWORD_RESET_NEUTRAL_MESSAGE =
  "If an account exists for that email, you'll get a reset link shortly.";
