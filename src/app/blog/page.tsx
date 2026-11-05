import BlogIndex, { blogIndexMetadata } from "@/components/blog/BlogIndex";

export const metadata = blogIndexMetadata("fa");
export default function LegacyBlogIndex() { return <BlogIndex locale="fa" />; }