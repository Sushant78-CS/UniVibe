import type { PostCategory } from "../../../api/postApi";

export const categories: {
  value: PostCategory;
  label: string;
}[] = [
  {
    value: "EVENT",
    label: "Event",
  },
  {
    value: "NEWS",
    label: "News",
  },
  {
    value: "ANNOUNCEMENT",
    label: "Announcement",
  },
  {
    value: "ACHIEVEMENT",
    label: "Achievement",
  },
  {
    value: "GENERAL",
    label: "General",
  },
];
