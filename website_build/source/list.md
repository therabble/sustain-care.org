---
layout: _basic_text.html
renderData:
    title: All Care Initiatives
---

# {{ renderData.title }}

{% for p in projects.records %}

[IMAGE] [{{ p.name }}](/{{ p.name | slug }}/)
{% if p.institutions.length > 0 %} (with {% for i in p.institutions %}{{ i.name }}, {% endfor %}){% endif %}
{% for t in p.tags %}{{ t }} {% endfor %}


<hr>
{% endfor %}

{% if tag %}
[See all Initiatives...](/list/)
{% endif %}

#### Filter by tag:

{% for tag in projects.tags %}
- [{{ tag }}](/list/{{tag}}/)
{% endfor %}

