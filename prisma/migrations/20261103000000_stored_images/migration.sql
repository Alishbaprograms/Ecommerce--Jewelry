-- Photos for products and reviews, stored in the database (resized and compressed before saving).
CREATE TABLE "StoredImage" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoredImage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StoredImage_kind_idx" ON "StoredImage"("kind");
