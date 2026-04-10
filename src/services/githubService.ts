export const githubService = {
  uploadImage: async (file: File): Promise<string> => {
    const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    const repo = process.env.NEXT_PUBLIC_GITHUB_REPO;
    
    if (!token || !repo) {
      throw new Error("GitHub configuration missing");
    }

    // Create a unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name.replace(/\s+/g, '-')}`;
    const path = `uploads/${fileName}`;

    // Read file as base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:image/...;base64,
      };
      reader.onerror = reject;
    });

    const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Upload image ${fileName}`,
        content: base64,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to upload to GitHub");
    }

    const data = await response.json();
    return data.content.download_url;
  }
};
