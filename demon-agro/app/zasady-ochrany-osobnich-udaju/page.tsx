"use client";

import { useState, useEffect } from "react";
import { getPageContent, defaultContent } from "@/lib/content";
import ReactMarkdown from "react-markdown";

export default function PrivacyPolicyPage() {
  const [content, setContent] = useState(defaultContent["privacy-policy"]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Explicitly cast to unknown then to the expected type or just use key access if strict typing allows
    const loadedContent = getPageContent("privacy-policy");
    // Ensure we have the default structure if something is missing in local storage
    setContent(loadedContent || defaultContent["privacy-policy"]);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] pt-32 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          {content.hero_nadpis || "Zásady ochrany osobních údajů"}
        </h1>
        
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="text-3xl font-bold mb-4 mt-8" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-2xl font-bold mb-3 mt-6 text-[#4A7C59]" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xl font-bold mb-2 mt-4" {...props} />,
              p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-gray-700" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-1" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-1" {...props} />,
              li: ({node, ...props}) => <li className="text-gray-700 ml-4" {...props} />,
              strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
              a: ({node, ...props}) => <a className="text-[#4A7C59] hover:underline" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[#4A7C59] pl-4 italic my-4 text-gray-600" {...props} />,
            }}
          >
            {content.privacy_text || ""}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
