export const BLOG_CATEGORIES: {
  title: string;
  slug: "news" | "education";
  description: string;
}[] = [
  {
    title: "News",
    slug: "news",
    description: "Product notes and announcements from GudDesk.",
  },
  {
    title: "Education",
    slug: "education",
    description: "Guides and tutorials for GudDesk.",
  },
];

export const BLOG_AUTHORS = {
  tim: {
    name: "Tim",
    image: "/_static/avatars/tim.jpeg",
    twitter: "timchosen",
  },
  guddesk: {
    name: "GudDesk Team",
    image: "/_static/logo.svg",
    twitter: "guddeskapp",
  },
};
