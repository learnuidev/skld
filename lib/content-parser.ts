export interface ContentNode {
  type: string;
  content?: ContentNode[];
  text?: string;
  attrs?: {
    level?: number;
  };
}

export interface ParsedSlide {
  intro?: string;
  heading?: string;
  content: ContentNode[];
}

export function parseContentToSlides(content: ContentNode[]): ParsedSlide[] {
  const slides: ParsedSlide[] = [];
  let currentSlide: ParsedSlide = {
    content: [],
  };
  let intro: string[] = [];

  for (let i = 0; i < content.length; i++) {
    const node = content[i];

    if (node.type === "paragraph") {
      const text = extractText(node);

      if (text.trim()) {
        if (intro.length === 0 || !currentSlide.heading) {
          intro.push(text);
        } else {
          currentSlide.content.push(node);
        }
      }
    } else if (node.type === "heading") {
      if (
        currentSlide.heading ||
        currentSlide.content.length > 0 ||
        intro.length > 0
      ) {
        slides.push({
          intro: intro.join("\n\n"),
          heading: currentSlide.heading,
          content: currentSlide.content,
        });
        intro = [];
        currentSlide = {
          heading: extractText(node),
          content: [],
        };
      } else {
        currentSlide.heading = extractText(node);
      }
    } else if (node.type === "bulletList") {
      if (!currentSlide.heading && intro.length > 0) {
        currentSlide.heading = "Introduction";
        slides.push({
          intro: intro.join("\n\n"),
          heading: currentSlide.heading,
          content: currentSlide.content,
        });
        intro = [];
        currentSlide = {
          heading: "Key Points",
          content: [],
        };
      }
      currentSlide.content.push(node);
    }
  }

  if (
    currentSlide.heading ||
    currentSlide.content.length > 0 ||
    intro.length > 0
  ) {
    slides.push({
      intro: intro.join("\n\n"),
      heading: currentSlide.heading,
      content: currentSlide.content,
    });
  }

  return slides;
}

function extractText(node: ContentNode): string {
  if (node.text) {
    return node.text;
  }

  if (node.content && Array.isArray(node.content)) {
    return node.content.map((child) => extractText(child)).join("");
  }

  return "";
}

export function isStructuredContent(content: any): boolean {
  if (!content || typeof content !== "object") {
    return false;
  }

  return content.type === "doc" && Array.isArray(content.content);
}
