from django import template

register = template.Library()

@register.filter(name='split')
def split(value, separator):
    if value:
        return value.split(separator)
    return [value]

@register.filter(name='get_message_text')
def get_message_text(content):
    if '📎 Documento anexado:' in content:
        return content.split('\n\n📎 Documento anexado:')[0]
    return content

@register.filter(name='get_document_name')
def get_document_name(content):
    if '📎 Documento anexado:' in content:
        parts = content.split('📎 Documento anexado:')
        if len(parts) > 1:
            return parts[1].strip()
    return None

@register.filter(name='has_document')
def has_document(content):
    return '📎 Documento anexado:' in content
