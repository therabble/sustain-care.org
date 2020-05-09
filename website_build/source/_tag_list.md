---
layout: _basic_text.html
pagination:
    data: projects.records_by_tag
    size: 1
    alias: tag
permalink: "/list/{{tag}}/"
renderData:
    title: "Care Initiatives tagged '{{tag}}': {{ projects.records_by_tag[tag].length }}"
---

# {{ renderData.title }}

{% for p in projects.records_by_tag[tag] %}

[IMAGE] [{{ p.name }}](/{{ p.name | slug }}/)
{% if p.institutions.length > 0 %} (with {% for i in p.institutions %}{{ i.name }}, {% endfor %}){% endif %}
{% for t in p.tags %}{{ t }} {% endfor %}


<hr>
{% endfor %}

[See all Initiatives...](/list/)

#### Filter by tag:

{% for tag in projects.tags %}
- [{{ tag }}](/list/{{tag}}/)
{% endfor %}

