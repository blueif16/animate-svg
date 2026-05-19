import { staticFile } from "remotion";

export const mediaSrc = (src: string): string => {
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:") ||
    src.startsWith("blob:") ||
    src.startsWith("file:") ||
    src.startsWith("/")
  ) {
    return src;
  }

  return staticFile(src);
};
