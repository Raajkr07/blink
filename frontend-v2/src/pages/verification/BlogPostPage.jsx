import { useParams, Link } from 'react-router-dom';
import { LegalLayout } from '../../components/layout';
import { getBlogById, blogPosts } from '../../data/blogData';

const categoryColors = {
    Engineering: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    Design: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    Backend: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    Philosophy: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    AI: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
};

const BlogPostPage = () => {
    const { id } = useParams();
    const post = getBlogById(id);

    if (!post) {
        return (
            <LegalLayout title="Blog Post Not Found" lastUpdated="">
                <section className="text-center py-16">
                    <p className="text-6xl mb-6">📝</p>
                    <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-3">
                        Oops! This article doesn't exist.
                    </h2>
                    <p className="text-[var(--color-gray-400)] mb-6">
                        The blog post you're looking for might have been moved or doesn't exist yet.
                    </p>
                    <Link
                        to="/blog"
                        className="inline-flex items-center gap-2 text-blue-400 font-semibold text-sm hover:underline"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back to Blog
                    </Link>
                </section>
            </LegalLayout>
        );
    }

    // Find prev/next posts for navigation
    const currentIndex = blogPosts.findIndex(p => p.id === id);
    const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null;
    const nextPost = currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null;

    return (
        <LegalLayout title={post.title} lastUpdated={post.date}>
            {/* Meta bar */}
            <section className="flex flex-wrap items-center gap-3 mb-8 -mt-4">
                <Link
                    to="/blog"
                    className="inline-flex items-center gap-1.5 text-[12px] text-[var(--color-gray-500)] hover:text-blue-400 transition-colors font-medium"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    All Posts
                </Link>
                <span className="text-[var(--color-gray-600)]">·</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${categoryColors[post.category] || 'text-slate-400 border-slate-500/30 bg-slate-500/10'}`}>
                    {post.category}
                </span>
                <span className="text-[11px] text-[var(--color-gray-500)] font-medium">{post.readTime}</span>
            </section>

            {/* Article body */}
            <article className="space-y-5">
                {post.content.map((block, i) => {
                    if (block.type === 'heading') {
                        return (
                            <h3 key={i} className="text-lg font-bold text-[var(--color-foreground)] mt-8 mb-2 tracking-tight flex items-center gap-2">
                                <span className="w-6 h-px bg-blue-500/50" />
                                {block.body}
                            </h3>
                        );
                    }
                    return (
                        <p key={i} className="text-[15px] leading-[1.9] text-[var(--color-gray-400)]">
                            {block.body}
                        </p>
                    );
                })}
            </article>

            {/* Post navigation */}
            <section className="mt-16 pt-8 border-t border-[var(--color-border)]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {prevPost ? (
                        <Link
                            to={`/blog/${prevPost.id}`}
                            className="group p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] hover:border-blue-500/30 transition-all duration-300"
                        >
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-gray-500)] mb-2 flex items-center gap-1.5">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                                Previous
                            </p>
                            <p className="text-[14px] font-semibold text-[var(--color-gray-300)] group-hover:text-blue-400 transition-colors line-clamp-2">
                                {prevPost.title}
                            </p>
                        </Link>
                    ) : <div />}

                    {nextPost ? (
                        <Link
                            to={`/blog/${nextPost.id}`}
                            className="group p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] hover:border-blue-500/30 transition-all duration-300 text-right"
                        >
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-gray-500)] mb-2 flex items-center justify-end gap-1.5">
                                Next
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </p>
                            <p className="text-[14px] font-semibold text-[var(--color-gray-300)] group-hover:text-blue-400 transition-colors line-clamp-2">
                                {nextPost.title}
                            </p>
                        </Link>
                    ) : <div />}
                </div>
            </section>

            {/* CTA */}
            <section className="mt-8 p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 text-center">
                <p className="text-[15px] text-[var(--color-gray-300)] font-medium">
                    Liked this article? There's plenty more to explore.
                </p>
                <Link
                    to="/blog"
                    className="inline-flex items-center gap-2 mt-3 text-sm text-blue-400 font-bold hover:underline"
                >
                    Browse All Articles →
                </Link>
            </section>
        </LegalLayout>
    );
};

export default BlogPostPage;
