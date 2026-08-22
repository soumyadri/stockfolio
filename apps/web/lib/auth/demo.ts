const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

function randomString(length: number): string {
  return Array.from({ length }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");
}

export function generateDemoCredentials(): { email: string; password: string } {
  return {
    email: `${randomString(13)}@random.com`,
    password: randomString(8),
  };
}
