export const APP_LINKS = {
  GITHUB_REPO: "https://github.com/TrisH0x2A/plynk",
};

export function parseGitHubRepo(url: string) {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[0], repo: parts[1] };
    }
  } catch {
    // Fallback if invalid URL
  }
  return { owner: "TrisH0x2A", repo: "plynk" };
}

export async function fetchGitHubStars(repoUrl: string): Promise<string> {
  try {
    const { owner, repo } = parseGitHubRepo(repoUrl);
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    if (response.ok) {
      const data = await response.json();
      if (typeof data.stargazers_count === "number") {
        return data.stargazers_count.toLocaleString();
      }
    }
  } catch (error) {
    console.warn("Failed to fetch dynamic GitHub stars:", error);
  }
  return "1.4k";
}
