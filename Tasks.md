# Project Tasks - Next Nasacy Blog

## Current Status
The project is a Next.js 15 blog application with the following features implemented:
- User authentication with Kinde Auth
- Blog post creation and display
- Category/tag system
- Comment system
- Like/bookmark functionality
- Responsive design with mobile navigation
- Dark mode support
- **Full InsightHub redesign completed** (all pages redesigned with new design system)

## Design System (Prose & Clarity)
- **Brand:** InsightHub - "The Future of Thought"
- **Font:** Inter (all levels)
- **Color Palette:** Indigo primary, Teal secondary, White surface with subtle gray containers
- **Grid:** 12-column layout, 720px content max, 1280px container max
- **Spacing:** 8px unit scale with 24px gutter
- **Elevation:** Ambient shadows + tonal layering with backdrop-blur nav
- **Shape:** Rounded (0.5rem) for small components, 1rem for large components

## Database Models

### User
- id (String, uuid)
- kindeId (String, unique)
- email (String, unique)
- name (String)
- imageUrl (String)
- role (Role: USER | ADMIN)
- createdAt (DateTime)
- updatedAt (DateTime)

### BlogPost
- id (String, uuid)
- title (String)
- slug (String, unique)
- excerpt (String)
- content (String)
- imageUrl (String)
- published (Boolean, default: false)
- featured (Boolean, default: false)
- viewCount (Int, default: 0)
- authorId (String) → User
- createdAt (DateTime)
- updatedAt (DateTime)

### Category
- id (String, uuid)
- name (String)
- slug (String, unique)
- description (String)
- createdAt (DateTime)

### PostCategory (Junction table)
- id (String, uuid)
- postId (String) → BlogPost
- categoryId (String) → Category

### Comment
- id (String, uuid)
- content (String)
- postId (String) → BlogPost
- authorId (String) → User
- parentId (String) → Comment (for replies)
- createdAt (DateTime)
- updatedAt (DateTime)

### Like
- id (String, uuid)
- userId (String) → User
- postId (String) → BlogPost
- createdAt (DateTime)

### Bookmark
- id (String, uuid)
- userId (String) → User
- postId (String) → BlogPost
- createdAt (DateTime)

### Report
- id (String, uuid)
- reporterId (String) → User
- postId (String) → BlogPost (optional)
- commentId (String) → Comment (optional)
- reason (String)
- resolved (Boolean, default: false)
- createdAt (DateTime)

## Completed Pages (Redesigned)
- [x] Homepage (/) - Featured hero + post grid + sidebar (categories, newsletter, writers)
- [x] Post Detail (/post/[slug]) - Full article with side interactions, author bio, related reads, comments
- [x] Category Page (/category/[slug]) - Category header + bento grid + related topics sidebar
- [x] Dashboard (/dashboard) - Analytics cards + recent posts table + workspace sidebar
- [x] Create Post (/dashboard/create) - Rich editor with toolbar + publish sidebar panel
- [x] Bookmarks (/bookmarks) - Bookmark grid with filter tabs + empty state
- [x] Admin Panel (/admin) - Sidebar + bento stats + moderation tables + user management
- [x] Search Results (/search) - Search input + filter sidebar + highlighted results + pagination
- [x] User Profile (/profile/[id]) - Cover image + avatar + stats + authored posts feed
- [x] Navigation - Fixed top bar + mobile bottom nav with search, library, profile tabs

## Completed Features
- [x] User authentication with Kinde
- [x] Blog post creation form (with rich editor UI)
- [x] Homepage with featured post and post listing
- [x] Individual post page with content display
- [x] Category/tag system
- [x] Basic comment system
- [x] Responsive navigation with mobile support
- [x] Dark mode toggle
- [x] Like functionality (client-side implementation)
- [x] Bookmark functionality (client-side implementation)
- [x] Comment submission functionality
- [x] Search functionality
- [x] Admin dashboard features
- [x] User profile page
- [x] Edit/delete posts
- [x] Rich text editor for content creation
- [x] Image upload functionality
- [x] Social sharing features
- [x] Notification system (UI)
- [x] Advanced analytics (dashboard cards)

## Issues to Address
1. Need to implement proper error handling
2. Missing form validation on the client-side
3. Need to improve accessibility
4. Comment client-side interactivity needs full implementation

## Next Steps
1. Add form validation and error handling
2. Improve accessibility throughout the application
3. Implement client-side interactivity for comment submission
4. Add actual image upload (not just URL)
