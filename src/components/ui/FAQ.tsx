import { faqSchema } from "@/lib/seo/json-ld";
import FAQItem from "../FAQItem";
import SectionHeader from "@/components/ui/SectionHeader";

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
    <section className="content-visibility relative overflow-hidden bg-bg section-pad">
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
        <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />

        <div className="mt-10 space-y-4">
          {items.map((item, index) => (
            <FAQItem
              key={item.question}
              question={item.question}
              answer={item.answer}
              defaultOpen={index === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}