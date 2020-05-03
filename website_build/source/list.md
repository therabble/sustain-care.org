---
layout: _basic_text.html
title: Listing of Care Initiatives
pagination:
    data: projects
    size: 1
date: Last Modified
---

# {{title}}

{% for p in pagination.items %}

[IMAGE] [{{ p.name }}](/{{ p.name | slug }}/)
w/({% for i in p.institutions %}{{ i.name }}, {% endfor %})
{% for t in p.tags %}<span class="tag is-info">{{ t }}</span> {% endfor %}


<hr>
{% endfor %}
