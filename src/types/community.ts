export interface CommunityPost {
  id?: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  images?: string[];
  createdAt: any;
  likes: number;
  commentCount: number;
  likedBy?: string[];
}

export interface CommunityComment {
  id?: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  createdAt: any;
}
