"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { quizService, QuizSet } from "@/services/quizService";
import { flashcardService, FlashcardSet } from "@/services/flashcardService";
import { communityService, CommunityPost, CommunityComment } from "@/services/communityService";
import { githubService } from "@/services/githubService";
import { 
  Search, 
  BookOpen, 
  Layers, 
  Users, 
  Download, 
  Star, 
  Globe, 
  ChevronRight, 
  MessageSquare, 
  Plus, 
  Image as ImageIcon, 
  Send, 
  Heart,
  X,
  MessageCircle,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import PageShell from "./PageShell";

export default function Community() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
  const [flashSets, setFlashSets] = useState<FlashcardSet[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastPostDoc, setLastPostDoc] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"quiz" | "flash" | "discussion">("discussion");
  
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCommunityContent();
    const unsubPosts = communityService.subscribeToPosts((newPosts, lastDoc) => {
      setPosts(newPosts);
      setLastPostDoc(lastDoc);
      setHasMore(newPosts.length >= 20);
    });
    return () => unsubPosts();
  }, []);

  const loadCommunityContent = async () => {
    setLoading(true);
    try {
      const [qSets, fSets] = await Promise.all([
        quizService.fetchPublicQuizSets(),
        flashcardService.fetchPublicSets()
      ]);
      setQuizSets(qSets);
      setFlashSets(fSets);
    } catch (error) {
      console.error("Error loading community content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user || !newPostContent.trim()) return;
    setIsUploading(true);
    try {
      const imageUrls = await Promise.all(
        selectedImages.map(file => githubService.uploadImage(file))
      );
      await communityService.createPost(
        user.uid,
        user.displayName || "Gia sư AI",
        newPostContent,
        imageUrls
      );
      setNewPostContent("");
      setSelectedImages([]);
      setIsCreatingPost(false);
    } catch (error) {
      console.error(error);
      alert("Lỗi khi đăng bài!");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedImages(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleLoadMore = async () => {
    if (!lastPostDoc || loadingMore) return;
    setLoadingMore(true);
    try {
      const { posts: morePosts, lastDoc } = await communityService.loadMorePosts(lastPostDoc);
      setPosts(prev => [...prev, ...morePosts]);
      setLastPostDoc(lastDoc);
      if (morePosts.length < 20) setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCloneQuiz = async (set: QuizSet) => {
    if (!user) return alert("Vui lòng đăng nhập để lưu bộ đề!");
    try {
      await quizService.cloneQuizSet(user.uid, set, user.displayName || "Gia sư AI");
      alert("Đã lưu bộ đề vào thư viện của bạn!");
    } catch (error) {
       console.error(error);
       alert("Lỗi khi lưu bộ đề.");
    }
  };

  const handleCloneFlash = async (set: FlashcardSet) => {
    if (!user) return alert("Vui lòng đăng nhập để lưu bộ thẻ!");
    try {
      await flashcardService.cloneSet(user.uid, set, user.displayName || "Gia sư AI");
      alert("Đã lưu bộ thẻ vào thư viện của bạn!");
    } catch (error) {
       console.error(error);
       alert("Lỗi khi lưu bộ thẻ.");
    }
  };

  const filteredQuiz = quizSets.filter(s => 
    (s.title || "").toLowerCase().includes(search.toLowerCase()) || 
    (s.authorName || "Anonymous").toLowerCase().includes(search.toLowerCase())
  );

  const filteredFlash = flashSets.filter(s => 
    (s.title || "").toLowerCase().includes(search.toLowerCase()) || 
    (s.authorName || "Anonymous").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageShell>
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="mb-12 md:mb-20">
          <div className="flex items-center gap-2.5 text-accent/40 font-bold uppercase text-[10px] tracking-[0.3em] mb-4">
             <Sparkles size={14} className="text-warning" />
             <span>Trung tâm cộng đồng</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-accent mb-12 tracking-tighter leading-[1.1]">
            Kết nối tri thức, <br />
            <span className="text-foreground/30 font-medium">Cùng nhau tiến bộ</span>
          </h1>

          <div className="flex flex-col xl:flex-row gap-6 items-center">
             <div className="relative flex-1 group w-full">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-accent transition-colors" size={18} />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm bộ đề, thảo luận hoặc tác giả..."
                  className="w-full bg-card/60 backdrop-blur-xl border border-border-notion rounded-2xl py-4.5 pl-14 pr-6 outline-none shadow-soft focus:ring-1 focus:ring-accent/10 transition-all font-bold text-accent placeholder:text-foreground/10"
                />
             </div>
             <div className="flex p-1.5 glass rounded-2xl shadow-soft gap-1 w-full xl:w-auto overflow-x-auto no-scrollbar border border-border-notion/50">
                <NavTab active={activeTab === "discussion"} onClick={() => setActiveTab("discussion")} icon={<MessageSquare size={16} />} label="Thảo luận" />
                <NavTab active={activeTab === "quiz"} onClick={() => setActiveTab("quiz")} icon={<BookOpen size={16} />} label="Bộ đề Quiz" />
                <NavTab active={activeTab === "flash"} onClick={() => setActiveTab("flash")} icon={<Layers size={16} />} label="Flashcard" />
             </div>
          </div>
        </header>

        {activeTab === "discussion" && (
          <div className="mb-12">
            {!isCreatingPost ? (
              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setIsCreatingPost(true)}
                className="w-full p-8 bg-card/40 backdrop-blur-sm border border-border-notion rounded-[32px] text-left flex items-center gap-6 hover:shadow-xl transition-all group border-dashed"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent text-background flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                  <Plus size={28} />
                </div>
                <div className="flex-1">
                   <p className="font-bold text-xl text-foreground/30 group-hover:text-accent/60 transition-colors">Bạn đang nghĩ gì? Chia sẻ ngay với mọi người...</p>
                </div>
              </motion.button>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass border border-border-notion rounded-[40px] p-10 shadow-2xl relative"
              >
                <button onClick={() => setIsCreatingPost(false)} className="absolute top-8 right-8 p-2 text-foreground/20 hover:text-error transition-all"><X size={24} /></button>
                <h3 className="text-xl font-extrabold text-accent mb-8 uppercase tracking-widest text-[11px] opacity-40">Tạo bài thảo luận mới</h3>
                
                <textarea 
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Đặt câu hỏi hoặc chia sẻ kiến thức của bạn..."
                  className="w-full bg-active-notion/40 border-none rounded-[32px] p-8 min-h-[180px] outline-none font-bold text-accent placeholder:text-foreground/5 text-xl mb-8 transition-all focus:ring-1 focus:ring-accent/5"
                />

                <div className="flex flex-wrap gap-4 mb-10">
                  {selectedImages.map((file, i) => (
                    <div key={i} className="relative w-28 h-28 rounded-2xl overflow-hidden group shadow-lg">
                      <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setSelectedImages(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute inset-0 bg-error/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      >
                         <X size={24} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-28 h-28 rounded-2xl border-2 border-dashed border-border-notion flex flex-col items-center justify-center text-foreground/20 hover:text-accent hover:border-accent transition-all bg-active-notion/10"
                  >
                    <ImageIcon size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-widest mt-2">+ Thêm ảnh</span>
                  </button>
                  <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageSelect} />
                </div>

                <div className="flex justify-end pt-8 border-t border-border-notion/50">
                  <button 
                    onClick={handleCreatePost}
                    disabled={isUploading || !newPostContent.trim()}
                    className="bg-accent text-background px-12 py-4 rounded-2xl font-bold uppercase text-xs tracking-[0.2em] shadow-2xl enabled:hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
                  >
                    {isUploading ? "Đang xử lý..." : "Đăng bài ngay"}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <AnimatePresence mode="wait">
             {activeTab === "quiz" && filteredQuiz.map((set, i) => (
               <CommunityCard 
                 key={set.id}
                 title={set.title}
                 description={set.description}
                 author={set.authorName || "Anonymous"}
                 count={set.questions.length}
                 type="quiz"
                 subject={set.subject}
                 onClone={() => handleCloneQuiz(set)}
                 index={i}
               />
             ))}
             {activeTab === "flash" && filteredFlash.map((set, i) => (
               <CommunityCard 
                 key={set.id}
                 title={set.title}
                 description={set.description}
                 author={set.authorName || "Anonymous"}
                 count={set.cards.length}
                 type="flash"
                 subject={set.subject}
                 onClone={() => handleCloneFlash(set)}
                 index={i}
               />
             ))}
           </AnimatePresence>
        </div>

        {activeTab === "discussion" && !loading && (
          <div className="flex flex-col gap-10 max-w-4xl mx-auto w-full">
            {posts.map((post, i) => (
              <PostCard key={post.id} post={post} user={user} index={i} />
            ))}
            {hasMore && posts.length >= 20 && (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="mx-auto px-10 py-4 glass border border-border-notion rounded-2xl text-xs font-bold uppercase tracking-widest text-accent/60 hover:text-accent transition-all disabled:opacity-40 shadow-soft"
              >
                {loadingMore ? "Đang tải dữ liệu..." : "Xem thêm thảo luận"}
              </button>
            )}
          </div>
        )}

        {!loading && (activeTab === "quiz" ? filteredQuiz.length : activeTab === "flash" ? filteredFlash.length : posts.length) === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-40 bg-active-notion/5 border-2 border-dashed border-border-notion rounded-[60px] opacity-20 col-span-full"
          >
             <Users size={64} className="mx-auto mb-6" />
             <p className="font-extrabold uppercase tracking-[0.3em] text-[10px]">Hiện chưa có nội dung nào được chia sẻ</p>
          </motion.div>
        )}
      </div>
    </PageShell>
  );
}

function NavTab({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-6 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2.5",
        active 
          ? "bg-accent text-background shadow-lg scale-105" 
          : "text-foreground/40 hover:bg-active-notion hover:text-accent/60"
      )}
    >
      <span className={cn("transition-colors", active ? "text-background" : "text-foreground/20")}>{icon}</span>
      {label}
    </button>
  );
}

function CommunityCard({ title, description, author, count, type, subject, onClone, index }: { title: string, description: string, author: string, count: number, type: "quiz" | "flash", subject?: string, onClone: () => void, index: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="bg-card/40 backdrop-blur-sm border border-border-notion rounded-[32px] p-8 hover:shadow-2xl transition-all flex flex-col items-start gap-4 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
         <div className="bg-accent text-background p-3 rounded-2xl shadow-xl">
            <Download size={20} />
         </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-1 bg-active-notion/60 rounded-full text-[9px] font-bold uppercase tracking-widest text-accent/60 mb-2 border border-border-notion">
         {type === "quiz" ? <BookOpen size={12} /> : <Layers size={12} />}
         {count} {type === "quiz" ? "câu hỏi" : "thẻ ghi nhớ"}
      </div>

      <div className="flex-1">
         <p className="text-[10px] font-bold text-accent/30 uppercase tracking-[0.2em] mb-2">📚 {subject || "Khác"}</p>
         <h3 className="text-2xl font-extrabold text-accent line-clamp-2 leading-tight tracking-tight mb-3">{title}</h3>
         <p className="text-foreground/40 text-sm font-medium line-clamp-2 h-10 leading-relaxed">{description || "Khám phá bộ học tập này..."}</p>
      </div>
      
      <div className="w-full h-px bg-border-notion/30 my-4" />

      <div className="w-full flex items-center justify-between mt-auto">
         <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent text-background flex items-center justify-center text-sm font-extrabold shadow-md">
               {author.charAt(0)}
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest leading-none mb-1">Tác giả</span>
               <span className="text-xs font-bold text-foreground/60">{author}</span>
            </div>
         </div>
         <button 
           onClick={(e) => { e.stopPropagation(); onClone(); }}
           className="px-6 py-2.5 bg-active-notion text-accent rounded-xl shadow-sm hover:bg-accent hover:text-background active:scale-95 transition-all text-xs font-bold"
         >
           Lưu về
         </button>
      </div>
    </motion.div>
  );
}

function PostCard({ post, user, index }: { post: CommunityPost, user: any, index: number }) {
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (showComments && post.id) {
      const unsub = communityService.subscribeToComments(post.id, setComments);
      return () => unsub();
    }
  }, [showComments, post.id]);

  const isLiked = post.likedBy?.includes(user?.uid);

  const handleLike = () => {
    if (post.id && user) {
      communityService.toggleLike(post.id, user.uid, !!isLiked);
    }
  };

  const handleAddComment = async () => {
    if (!user || !commentContent.trim() || !post.id) return;
    await communityService.addComment(post.id, user.uid, user.displayName || "Gia sư AI", commentContent);
    setCommentContent("");
    setIsCommenting(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.1, 0.5) }}
      className="bg-card/40 backdrop-blur-sm border border-border-notion rounded-[40px] p-10 md:p-12 shadow-soft hover:shadow-2xl hover:shadow-accent/5 transition-all"
    >
      <div className="flex items-center gap-5 mb-10">
        <div className="w-14 h-14 rounded-[20px] bg-accent text-background flex items-center justify-center font-extrabold text-xl shadow-2xl shadow-accent/10 border-4 border-background/20">
          {post.userName.charAt(0)}
        </div>
        <div>
          <h4 className="font-extrabold text-xl text-accent leading-none mb-2 tracking-tight">{post.userName}</h4>
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-success/40" />
             <span className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest">
               {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString("vi", { day: 'numeric', month: 'long' }) : "Vừa xong"}
             </span>
          </div>
        </div>
      </div>

      <p className="text-2xl font-bold text-accent leading-[1.6] mb-10 whitespace-pre-wrap tracking-tight">{post.content}</p>

      {post.images && post.images.length > 0 && (
        <div className={cn("grid gap-6 mb-10", post.images.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
          {post.images.map((url, i) => (
            <motion.img 
              whileHover={{ scale: 1.02 }}
              key={i} 
              src={url} 
              className="w-full h-[450px] object-cover rounded-[32px] border border-border-notion shadow-2xl" 
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-8 pt-8 border-t border-border-notion/40">
        <button 
          onClick={handleLike} 
          className={cn(
            "flex items-center gap-3 group transition-all",
            isLiked ? "text-error" : "text-accent/60"
          )}
        >
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm border",
            isLiked ? "bg-error text-background border-error scale-110 shadow-error/20" : "bg-active-notion/40 text-error group-hover:scale-110 border-transparent"
          )}>
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} strokeWidth={2.5} />
          </div>
          <span className="text-base font-extrabold">{post.likes}</span>
        </button>
        <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-3 group transition-all">
          <div className="w-12 h-12 rounded-2xl bg-active-notion/40 border border-transparent flex items-center justify-center text-accent/60 group-hover:scale-110 transition-all group-hover:border-accent/10">
            <MessageCircle size={20} strokeWidth={2.5} />
          </div>
          <span className="text-base font-extrabold text-accent/60">{post.commentCount} <span className="text-foreground/20 font-medium ml-1">phản hồi</span></span>
        </button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-10 space-y-5">
              {comments.map(comment => (
                <motion.div 
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  key={comment.id} 
                  className="flex gap-5 p-6 bg-active-notion/20 rounded-[28px] border border-border-notion/20"
                >
                   <div className="w-10 h-10 rounded-xl bg-accent text-background flex items-center justify-center text-xs font-extrabold shrink-0 shadow-sm">
                      {comment.userName.charAt(0)}
                   </div>
                   <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-extrabold text-accent mb-1 uppercase tracking-wider">{comment.userName}</h5>
                      <p className="text-[15px] font-medium text-accent/70 leading-relaxed">{comment.content}</p>
                   </div>
                </motion.div>
              ))}

              <div className="pt-6 flex items-center gap-4">
                 <input 
                   value={commentContent}
                   onChange={(e) => setCommentContent(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                   placeholder="Nhập phản hồi của bạn..."
                   className="flex-1 bg-active-notion/40 border-none rounded-2xl px-8 py-4 text-sm font-bold outline-none text-accent placeholder:text-foreground/10 focus:ring-1 focus:ring-accent/10 transition-all"
                 />
                 <button 
                   onClick={handleAddComment}
                   disabled={!commentContent.trim()}
                   className="p-4 bg-accent text-background rounded-2xl shadow-xl shadow-accent/20 disabled:opacity-20 active:scale-90 transition-all"
                 >
                   <Send size={20} />
                 </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
