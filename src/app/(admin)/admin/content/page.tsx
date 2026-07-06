import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Image, Layout } from "lucide-react";

export const metadata: Metadata = { title: "Content — Admin" };

const sections = [
  {
    icon: Layout,
    title: "Banners",
    description: "Manage homepage announcement banners and promotional strips.",
    href: "#",
  },
  {
    icon: FileText,
    title: "Blog / Journal",
    description: "Write and publish articles, guides, and brand stories.",
    href: "#",
  },
  {
    icon: Image,
    title: "Media Library",
    description: "Browse and manage all uploaded images and assets.",
    href: "#",
  },
];

export default function ContentPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light">Content</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your store's content and media</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((s) => (
          <div key={s.title} className="border border-border p-6 hover:border-foreground/40 transition-colors">
            <s.icon className="h-6 w-6 text-muted-foreground mb-3" strokeWidth={1.5} />
            <h2 className="font-medium mb-1">{s.title}</h2>
            <p className="text-sm text-muted-foreground">{s.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
