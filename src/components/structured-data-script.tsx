interface StructuredDataScriptProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

function serializeStructuredData(data: StructuredDataScriptProps["data"]) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function StructuredDataScript({ data }: StructuredDataScriptProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeStructuredData(data) }}
    />
  );
}
