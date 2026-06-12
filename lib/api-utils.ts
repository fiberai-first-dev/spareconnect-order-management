export async function readJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) {
    throw new Error("Server returned an empty response");
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Invalid server response");
  }
}

export async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = await readJsonResponse<{ error?: string }>(res);
    return data.error || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}
