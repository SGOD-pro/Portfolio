import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { resolveMarkdownUrl } from "../src/lib/markdown/resolveUrl.ts";
import { getArchitectureDocument } from "../src/lib/github/api.ts";
import { GitHubApiError } from "../src/lib/github/client.ts";

describe("Phase 3 Project Reader Acceptance Tests", () => {
  test("resolveMarkdownUrl rejects dangerous schemes and preserves anchors", () => {
    // Unsafe schemes rejected
    assert.equal(
      resolveMarkdownUrl("javascript:alert(1)", "SGOD-pro", "Portfolio"),
      "#"
    );
    assert.equal(
      resolveMarkdownUrl("data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==", "SGOD-pro", "Portfolio"),
      "#"
    );
    assert.equal(
      resolveMarkdownUrl("vbscript:msgbox(1)", "SGOD-pro", "Portfolio"),
      "#"
    );

    // Anchors preserved
    assert.equal(
      resolveMarkdownUrl("#installation", "SGOD-pro", "Portfolio"),
      "#installation"
    );

    // Absolute URLs preserved
    assert.equal(
      resolveMarkdownUrl("https://example.com/demo", "SGOD-pro", "Portfolio"),
      "https://example.com/demo"
    );
  });

  test("resolveMarkdownUrl resolves relative links and images against repository and ref", () => {
    // Relative link from root
    assert.equal(
      resolveMarkdownUrl("docs/setup.md", "SGOD-pro", "Portfolio", "main", "README.md", false),
      "https://github.com/SGOD-pro/Portfolio/blob/main/docs/setup.md"
    );

    // Relative link with ./ prefix
    assert.equal(
      resolveMarkdownUrl("./CONTRIBUTING.md", "SGOD-pro", "Portfolio", "master", "README.md", false),
      "https://github.com/SGOD-pro/Portfolio/blob/master/CONTRIBUTING.md"
    );

    // Relative image resolution uses raw.githubusercontent.com
    assert.equal(
      resolveMarkdownUrl("assets/architecture.png", "SGOD-pro", "Portfolio", "main", "README.md", true),
      "https://raw.githubusercontent.com/SGOD-pro/Portfolio/main/assets/architecture.png"
    );

    // Relative image inside docs/ folder resolves relative to docs/
    assert.equal(
      resolveMarkdownUrl("diagram.svg", "SGOD-pro", "Portfolio", "main", "docs/architecture.md", true),
      "https://raw.githubusercontent.com/SGOD-pro/Portfolio/main/docs/diagram.svg"
    );
  });

  test("getArchitectureDocument finds root architecture.md on candidate 1", async () => {
    const mockFetch: typeof fetch = async (input) => {
      const url = String(input);
      if (url.includes("/contents/architecture.md")) {
        return new Response(
          JSON.stringify({
            name: "architecture.md",
            path: "architecture.md",
            sha: "abc111",
            size: 250,
            html_url: "https://github.com/SGOD-pro/Portfolio/blob/main/architecture.md",
            content: Buffer.from("# Root Architecture").toString("base64"),
            encoding: "base64",
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        );
      }
      return new Response(JSON.stringify({ message: "Not Found" }), { status: 404 });
    };

    const res = await getArchitectureDocument("SGOD-pro", "MockRepo1", { customFetch: mockFetch });
    assert.equal(res.document.path, "architecture.md");
    assert.ok(res.document.content.includes("# Root Architecture"));
  });

  test("getArchitectureDocument finds docs/architecture.md on candidate 2 when root is 404", async () => {
    const mockFetch: typeof fetch = async (input) => {
      const url = String(input);
      if (url.includes("/contents/architecture.md")) {
        return new Response(JSON.stringify({ message: "Not Found" }), { status: 404 });
      }
      if (url.includes("/contents/docs%2Farchitecture.md")) {
        return new Response(
          JSON.stringify({
            name: "architecture.md",
            path: "docs/architecture.md",
            sha: "abc222",
            size: 350,
            html_url: "https://github.com/SGOD-pro/Portfolio/blob/main/docs/architecture.md",
            content: Buffer.from("# Docs Architecture").toString("base64"),
            encoding: "base64",
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        );
      }
      return new Response(JSON.stringify({ message: "Not Found" }), { status: 404 });
    };

    const res = await getArchitectureDocument("SGOD-pro", "MockRepo2", { customFetch: mockFetch });
    assert.equal(res.document.path, "docs/architecture.md");
    assert.ok(res.document.content.includes("# Docs Architecture"));
  });

  test("getArchitectureDocument finds docs/atchitecture.md typo on candidate 3 when earlier are 404", async () => {
    const mockFetch: typeof fetch = async (input) => {
      const url = String(input);
      if (url.includes("atchitecture.md")) {
        return new Response(
          JSON.stringify({
            name: "atchitecture.md",
            path: "docs/atchitecture.md",
            sha: "abc333",
            size: 400,
            html_url: "https://github.com/SGOD-pro/Portfolio/blob/main/docs/atchitecture.md",
            content: Buffer.from("# Typo Architecture").toString("base64"),
            encoding: "base64",
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        );
      }
      return new Response(JSON.stringify({ message: "Not Found" }), { status: 404 });
    };

    const res = await getArchitectureDocument("SGOD-pro", "MockRepo3", { customFetch: mockFetch });
    assert.equal(res.document.path, "docs/atchitecture.md");
    assert.ok(res.document.content.includes("# Typo Architecture"));
  });

  test("getArchitectureDocument throws 404 when all candidates are 404", async () => {
    const mockFetch: typeof fetch = async () => {
      return new Response(JSON.stringify({ message: "Not Found" }), { status: 404 });
    };

    await assert.rejects(
      async () => {
        await getArchitectureDocument("SGOD-pro", "EmptyRepo", { customFetch: mockFetch });
      },
      (err: unknown) => {
        return err instanceof GitHubApiError && err.statusCode === 404;
      }
    );
  });

  test("getArchitectureDocument rethrows API failure (500) rather than treating as missing document", async () => {
    const mockFetch: typeof fetch = async () => {
      return new Response(JSON.stringify({ message: "Internal GitHub Error" }), { status: 500 });
    };

    await assert.rejects(
      async () => {
        await getArchitectureDocument("SGOD-pro", "BrokenRepo", { customFetch: mockFetch });
      },
      (err: unknown) => {
        return err instanceof GitHubApiError && err.statusCode === 500;
      }
    );
  });

  test("getRepositoryDocument and getArchitectureDocument work with custom owner", async () => {
    const mockFetch: typeof fetch = async (input) => {
      const url = String(input);
      if (url.includes("/contents/backend%2Farchitecture.md")) {
        return new Response(
          JSON.stringify({
            name: "architecture.md",
            path: "backend/architecture.md",
            sha: "custom123",
            size: 5825,
            html_url: "https://github.com/Loading404-ux/interview-prep/blob/main/backend/architecture.md",
            content: Buffer.from("# Backend Architecture").toString("base64"),
            encoding: "base64",
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        );
      }
      if (url.includes("/git/trees/")) {
        return new Response(
          JSON.stringify({
            tree: [{ path: "backend/architecture.md", type: "blob" }],
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        );
      }
      if (url.endsWith("/repos/Loading404-ux/interview-prep")) {
        return new Response(
          JSON.stringify({
            id: 999,
            name: "interview-prep",
            full_name: "Loading404-ux/interview-prep",
            description: "Full-stack prep",
            html_url: "https://github.com/Loading404-ux/interview-prep",
            default_branch: "main",
            private: false,
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        );
      }
      return new Response(JSON.stringify({ message: "Not Found" }), { status: 404 });
    };

    const res = await getArchitectureDocument("Loading404-ux", "interview-prep", { customFetch: mockFetch });
    assert.equal(res.document.path, "backend/architecture.md");
    assert.equal(res.document.repo, "Loading404-ux/interview-prep");
  });
});
