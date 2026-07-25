// Lightweight {{var}} placeholder renderer (Handlebars-style, no engine dependency).
// Also substitutes ${{var}} -> $<value> (literal dollar + value).
export function renderTemplate(template: string, data: Record<string, any>): string {
  return template
    // ${{var}} -> $<value>
    .replace(/\$\{\{\s*(\w+)\s*\}\}/g, (_m, key) => `$${data[key] ?? ''}`)
    // {{var}} -> <value>
    .replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, key) => (data[key] ?? '').toString());
}

// Each block: {{#each items}}...{{/each}} renders the inner template per item.
export function renderEach(template: string, data: Record<string, any>): string {
  return template.replace(
    /\{\{#each\s+(\w+)\s*\}\}([\s\S]*?)\{\{\/each\}\}/g,
    (_m, key, inner) => {
      const arr = data[key];
      if (!Array.isArray(arr)) return '';
      return arr
        .map((item: any) =>
          inner.replace(/\{\{\s*(\w+)\s*\}\}/g, (_mm: string, k: string) => (item[k] ?? '').toString())
        )
        .join('');
    }
  );
}
