export function optimizeCloudinaryImage(
  url: string | null | undefined,
  width = 1080,
): string | null {
  if (!url) {
    return null;
  }

  if (!url.includes("res.cloudinary.com")) {
    return url;
  }

  if (!url.includes("/image/upload/")) {
    return url;
  }

  if (url.includes("q_auto") || url.includes("f_auto")) {
    return url;
  }

  return url.replace(
    "/image/upload/",
    `/image/upload/w_${width},c_limit,q_auto,f_auto/`,
  );
}

export function optimizeCloudinaryVideo(
  url: string | null | undefined,
  width = 1080,
): string | null {
  if (!url) {
    return null;
  }

  if (!url.includes("res.cloudinary.com")) {
    return url;
  }

  if (!url.includes("/video/upload/")) {
    return url;
  }

  if (url.includes("q_auto") || url.includes("f_auto")) {
    return url;
  }

  return url.replace(
    "/video/upload/",
    `/video/upload/w_${width},c_limit,q_auto,f_auto/`,
  );
}
