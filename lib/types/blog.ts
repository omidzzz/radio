export interface BlogPost {
  id: number;
  titleFA: string;
  titleEN?: string;
  excerptFA: string;
  excerptEN?: string;
  bodyFA: string;
  bodyEN?: string;
  authorFA: string;
  authorEN?: string;
  categoryFA: string;
  categoryEN?: string;
  image?: string;
  readMinutes: number;
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogComment {
  id: number;
  postId: number;
  authorName: string;
  content: string;
  createdAt: string;
}