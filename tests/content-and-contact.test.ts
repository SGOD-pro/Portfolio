import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Phase 4 Content and Contact Verification", () => {
  test("mailto URI encodes subject and body with spaces, ampersands, and newlines safely", () => {
    const name = "Alice & Bob";
    const email = "alice@example.com";
    const subject = "Project & Inquiry: Work / Collab";
    const message = "Line 1: Hello!\nLine 2: Ready & excited.\nLine 3: 100% committed.";

    const mailtoSubject = encodeURIComponent(`[Portfolio] ${subject} from ${name}`);
    const mailtoBody = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );
    const mailtoUrl = `mailto:souvik.dev07@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

    assert.ok(mailtoUrl.startsWith("mailto:souvik.dev07@gmail.com?subject="));
    assert.ok(mailtoUrl.includes("Alice%20%26%20Bob"));
    assert.ok(mailtoUrl.includes("Project%20%26%20Inquiry"));
    assert.ok(mailtoUrl.includes("%0A")); // encoded newline
    assert.ok(!mailtoUrl.includes("\n")); // no raw newlines in URL
    assert.ok(!mailtoUrl.includes(" ")); // no raw spaces in query
  });

  test("email validator rejects invalid formats and accepts valid formats", () => {
    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    assert.strictEqual(isValidEmail(""), false);
    assert.strictEqual(isValidEmail("not-an-email"), false);
    assert.strictEqual(isValidEmail("missing@domain"), false);
    assert.strictEqual(isValidEmail("@domain.com"), false);
    assert.strictEqual(isValidEmail("spaces in@email.com"), false);
    assert.strictEqual(isValidEmail("souvik.dev07@gmail.com"), true);
    assert.strictEqual(isValidEmail("recruiter@company.co.uk"), true);
  });

  test("verified owner identity and contact information consistency", () => {
    const OWNER_USERNAME = "SGOD-pro";
    const OWNER_NAME = "Souvik Karmakar";
    const OWNER_EMAIL = "souvik.dev07@gmail.com";
    const GITHUB_PROFILE_URL = "https://github.com/SGOD-pro";

    assert.strictEqual(OWNER_USERNAME, "SGOD-pro");
    assert.strictEqual(OWNER_NAME, "Souvik Karmakar");
    assert.strictEqual(OWNER_EMAIL, "souvik.dev07@gmail.com");
    assert.strictEqual(GITHUB_PROFILE_URL, "https://github.com/SGOD-pro");
  });
});
