import type { BlogBlock } from "@/lib/blog/schema";
import type { Locale } from "@/lib/i18n/config";
import {
  MedicalCallout,
  DefinitionCard,
  KeyTakeaways,
  ArticleFigure,
  ArticleQuote,
  ReferencesSection,
  FAQSection,
} from "./EditorialComponents";

function Block({ block, index, title, locale }: { block: BlogBlock; index: number; title: string; locale: Locale }) {
  const fa = locale === "fa";
  switch (block.type) {
    case "heading": {
      if (block.level === 1 && block.text === title) return null;
      const Tag = `h${Math.max(2, block.level)}` as "h2" | "h3" | "h4" | "h5" | "h6";
      return <Tag id={`block-${index + 1}`}>{block.text}</Tag>;
    }
    case "paragraph": return <p className={block.style === "lead" ? "blog-lead" : undefined}>{block.text}</p>;
    case "list": {
      const Tag = block.style === "bullet" ? "ul" : "ol";
      return <Tag>{block.items.map((text, i) => <li key={i}>{text}</li>)}</Tag>;
    }
    case "stats": return <dl className="blog-stats">{block.items.map((item, i) => <div key={i}><dd>{item.value}</dd><dt>{item.label}</dt></div>)}</dl>;
    case "image": return <ArticleFigure src={block.src} alt={block.alt} caption={block.caption} width={block.width} height={block.height} />;
    case "cta": return <aside className="blog-cta text-center"><h2>{block.title}</h2><p>{block.text}</p><a className="ui-button ui-button-primary" href={block.buttonUrl}>{block.buttonText}<span aria-hidden="true">{fa ? "←" : "→"}</span></a></aside>;
    case "callout": return <MedicalCallout tone={block.tone} title={block.title}>{block.text}</MedicalCallout>;
    case "quote": return <ArticleQuote text={block.text} attribution={block.attribution} sourceUrl={block.sourceUrl} />;
    case "table": return <div className="blog-table-wrap" role="region" aria-label={block.caption} tabIndex={0}><table><caption>{block.caption}</caption><thead><tr>{block.headers.map((header, i) => <th scope="col" key={i}>{header}</th>)}</tr></thead><tbody>{block.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => j === 0 ? <th scope="row" key={j}>{cell}</th> : <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>;
    case "timeline": return <section className="blog-panel">{block.title && <h3>{block.title}</h3>}<ol className="blog-timeline">{block.items.map((item, i) => <li key={i}>{item.label && <span className="blog-eyebrow">{item.label}</span>}<h4>{item.title}</h4><p>{item.text}</p></li>)}</ol></section>;
    case "checklist": return <KeyTakeaways title={block.title} items={block.items} />;
    case "accordion": return <FAQSection title={block.title} items={block.items} />;
    case "glossary": return <section className="blog-panel">{block.title && <h3>{block.title}</h3>}<div className="blog-glossary">{block.items.map((item, i) => <DefinitionCard key={i} term={item.term} definition={item.definition} />)}</div></section>;
    case "references": return <ReferencesSection title={block.title ?? (fa ? "منابع" : "References")} items={block.items} />;
    case "divider": return <hr />;
    case "code": return <figure className="blog-code">{block.caption && <figcaption>{block.caption}</figcaption>}<pre dir="ltr" tabIndex={0}><code className={`language-${block.language}`}>{block.code}</code></pre></figure>;
  }
}

/** Text stays escaped by React. Only the legacy renderer accepts sanitized HTML. */
export default function BlogBlocks({ blocks, title, locale }: { blocks: BlogBlock[]; title: string; locale: Locale }) {
  return blocks.map((block, index) => <Block key={index} block={block} index={index} title={title} locale={locale} />);
}