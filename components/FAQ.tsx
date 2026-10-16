import { faqSchema } from "@/lib/json-ld";
import FAQItem from "./FAQItem";
import ChapterHead from "@/components/ui/ChapterHead";

interface FAQItemData {
  question: string;
  answer: string;
}

interface FAQProps {
  title: string;
  subtitle?: string;
  items: FAQItemData[];
}

export default function FAQ({
  title,
  subtitle,
  items,
  eyebrow,
}: FAQProps & { eyebrow?: string }) {
  return (
    <section className="mod-faq content-visibility relative overflow-hidden section-pad">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            faqSchema(
              items.map((item) => ({
                question: item.question,
                answer: item.answer,
              }))
            )
          ),
        }}
      />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <ChapterHead label={eyebrow} title={title} lede={subtitle} align="start" variant="panel" />

        <div className="mt-10 space-y-4">
          {items.map((item, index) => (
            <FAQItem
              key={item.question}
              question={item.question}
              answer={item.answer}
              defaultOpen={index === 0}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}