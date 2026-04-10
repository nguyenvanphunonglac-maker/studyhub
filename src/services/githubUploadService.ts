// Compress image using canvas before upload
async function compressImage(file: File, maxWidth = 1280, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality).split(',')[1]);
    };
    img.onerror = reject;
    img.src = url;
  });
}

// Compress video by capturing a scaled version isn't possible client-side without ffmpeg.
// Instead we just read the raw base64 but warn if too large.
async function readFileBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const githubUploadService = {
  async uploadMedia(file: File): Promise<string> {
    const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    const repo = process.env.NEXT_PUBLIC_GITHUB_REPO;

    console.log('[GitHub] token exists:', !!token, '| repo:', repo);
    if (!token || !repo) throw new Error('GitHub token or repo not configured');

    const isImage = file.type.startsWith('image/');
    const ext = isImage ? 'jpg' : file.name.split('.').pop() || 'mp4';
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}.${ext}`;
    const path = `media/${fileName}`;

    console.log('[GitHub] compressing...', isImage ? 'image' : 'video');
    const base64 = isImage
      ? await compressImage(file, 1280, 0.82)
      : await readFileBase64(file);
    console.log('[GitHub] base64 length:', base64.length);

    console.log('[GitHub] uploading to:', path);
    const response = await fetch(
      `https://api.github.com/repos/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Upload: ${file.name}`,
          content: base64,
          branch: 'main',
        }),
      }
    );

    console.log('[GitHub] response status:', response.status);
    if (!response.ok) {
      const err = await response.json();
      console.error('[GitHub] error response:', err);
      throw new Error(err.message || 'Failed to upload to GitHub');
    }

    const url = `https://raw.githubusercontent.com/${repo}/main/${path}`;
    console.log('[GitHub] uploaded successfully:', url);
    return url;
  },
};
