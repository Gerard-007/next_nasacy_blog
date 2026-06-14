# Model Structures

## User
```prisma
model User {
  id         String      @id @default(uuid())
  kindeId    String?     @unique
  email      String      @unique
  name       String?
  imageUrl   String?
  role       Role        @default(USER)

  posts      BlogPost[]  @relation("AuthorPosts")
  comments   Comment[]
  likes      Like[]
  bookmarks  Bookmark[]
  reports    Report[]

  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
}
```

## BlogPost
```prisma
model BlogPost {
  id         String        @id @default(uuid())
  title      String
  slug       String        @unique
  excerpt    String?
  content    String
  imageUrl   String?
  published  Boolean       @default(false)
  featured   Boolean       @default(false)
  viewCount  Int           @default(0)

  authorId   String
  author     User          @relation("AuthorPosts", fields: [authorId], references: [id])

  comments   Comment[]
  likes      Like[]
  bookmarks  Bookmark[]
  categories PostCategory[]

  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt
}
```

## Category
```prisma
model Category {
  id         String         @id @default(uuid())
  name       String
  slug       String         @unique
  description String?

  posts      PostCategory[]

  createdAt  DateTime       @default(now())
}
```

## PostCategory
```prisma
model PostCategory {
  id         String    @id @default(uuid())
  post       BlogPost  @relation(fields: [postId], references: [id])
  postId     String
  category   Category  @relation(fields: [categoryId], references: [id])
  categoryId String

  @@unique([postId, categoryId])
}
```

## Comment
```prisma
model Comment {
  id         String     @id @default(uuid())
  content    String

  postId     String
  post       BlogPost   @relation(fields: [postId], references: [id])

  authorId   String
  author     User       @relation(fields: [authorId], references: [id])

  parentId   String? 
  parent     Comment?   @relation("CommentReplies", fields: [parentId], references: [id])
  replies    Comment[]  @relation("CommentReplies")

  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
}
```

## Like
```prisma
model Like {
  id         String    @id @default(uuid())
  user       User      @relation(fields: [userId], references: [id])
  userId     String
  post       BlogPost  @relation(fields: [postId], references: [id])
  postId     String
  createdAt  DateTime  @default(now())

  @@unique([userId, postId])
}
```

## Bookmark
```prisma
model Bookmark {
  id         String    @id @default(uuid())
  user       User      @relation(fields: [userId], references: [id])
  userId     String
  post       BlogPost  @relation(fields: [postId], references: [id])
  postId     String
  createdAt  DateTime  @default(now())

  @@unique([userId, postId])
}
```

## Report
```prisma
model Report {
  id          String    @id @default(uuid())
  reporterId  String
  reporter    User      @relation(fields: [reporterId], references: [id])

  postId      String? 
  post        BlogPost? @relation(fields: [postId], references: [id])

  commentId   String?
  comment     Comment?  @relation(fields: [commentId], references: [id])

  reason      String
  resolved    Boolean   @default(false)
  createdAt   DateTime  @default(now())
}
```