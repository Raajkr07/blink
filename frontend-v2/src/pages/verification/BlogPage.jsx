import { Link } from 'react-router-dom';
import { LegalLayout } from '../../components/layout';
import { blogPosts } from '../../data/blogData';

const categoryColors = {
    Engineering: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    Design: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    Backend: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    Philosophy: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    AI: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
};

const BlogCard = ({ post }) => (
    <Link to={`/blog/${post.id}`} className="block group">
        <article className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 blur-3xl rounded-full group-hover:bg-blue-500/10 transition-colors duration-500" />

            <div className="flex items-center gap-3 mb-4">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${categoryColors[post.category] || 'text-slate-400 border-slate-500/30 bg-slate-500/10'}`}>
                    {post.category}
                </span>
                <span className="text-[11px] text-[var(--color-gray-500)] font-medium">{post.date}</span>
                <span className="text-[11px] text-[var(--color-gray-500)]">·</span>
                <span className="text-[11px] text-[var(--color-gray-500)] font-medium">{post.readTime}</span>
            </div>

            <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-3 tracking-tight group-hover:text-blue-400 transition-colors duration-300">
                {post.title}
            </h3>

            <p className="text-[15px] leading-[1.8] text-[var(--color-gray-400)]">
                {post.excerpt}
            </p>

            <div className="mt-4 flex items-center gap-2 text-[12px] text-blue-400 font-semibold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Read Full Article
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </div>
        </article>
    </Link>
);

const BlogPage = () => (
    <LegalLayout title="Our Blog" lastUpdated="3 March 2026">
        <section className="mb-8">
            <p className="text-[17px] leading-[1.9] text-[var(--color-gray-300)]">
                Welcome to our little corner of the internet. Here you'll find the honest stories, engineering
                deep-dives, and design decisions behind building Blinx AI Assistant. Written by students, for
                anyone who's curious about how things are built from scratch.
            </p>
            <p className="text-[15px] leading-[1.8] text-[var(--color-gray-400)] mt-3">
                Grab a chai, settle in, and read at your pace. Each post is self-contained — pick whatever catches
                your eye.
            </p>
        </section>

        <div className="space-y-5">
            {blogPosts.map(post => (
                <BlogCard key={post.id} post={post} />
            ))}
        </div>

        <section className="mt-12 pt-8 border-t border-[var(--color-border)]">
            <p className="text-center text-[14px] text-[var(--color-gray-500)] italic">
                More articles coming soon. We're busy building and writing at the same time! 🚀
            </p>
        </section>
    </LegalLayout>
);

export default BlogPage;
