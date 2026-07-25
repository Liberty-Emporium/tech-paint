fn = 'src/lib/email-templates.ts'
with open(fn) as f:
    c = f.read()
# Current state has '$${{' from earlier wrong edit. We want literal '${{' text in output.
# In a JS template literal, to emit a literal '$' followed by '{', write '\${{'.
n = c.count('$${{')
c = c.replace('$${{', '\\${{')
with open(fn, 'w') as f:
    f.write(c)
print('email-templates: reverted', n, 'to escaped \\${{')

fn2 = 'src/app/estimates/new/page.tsx'
with open(fn2) as f:
    c2 = f.read()
c2 = c2.replace('if (value) formData.append(key, value);', 'if (value) fd.append(key, value);')
with open(fn2, 'w') as f:
    f.write(c2)
print('new/page: fixed fd.append')
