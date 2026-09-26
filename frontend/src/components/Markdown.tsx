import { useMemo } from "react";
import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: false });

export default function Markdown({ text, className = "" }: { text: string; className?: string }) {
  const html = useMemo(() => marked.parse(text, { async: false }) as string, [text]);
  // Reports are written by our own analysis agents into the repo; rendering them as HTML is intended.
  return <div className={`prose-report ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
