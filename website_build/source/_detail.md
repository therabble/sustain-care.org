---
layout: _initiative_detail.html
pagination:
    data: projects.records
    size: 1
    alias: project
permalink: "/{{project.name | slug}}/"
renderData:
    title: "{{project.name}}"
---

# {{ renderData.title }}

[LOGO] [PHOTO(S)]

{{ project.description }}

##### Tags:
{% for t in project.tags %}[<span class="tag is-info">{{ t }}</span>](/list/{{t}}/) {% endfor %}

##### Details:

Fundraising Page: <{{ project.fundraising_url }}>

Fundraising Contact Email: <{{ project.fundraising_email }}>

Representative: {{ project.representative_name }} [IMAGE]

Website: <{{ project.main_url }}>

Social Media: {% for s in project.social_urls %}<{{ s }}> {% endfor %}

##### Associated Institutions:

{% for i in project.institutions %}
* [{{ i.name }} ]({{ i.url }}) {{ i.role }} : [IMAGE]
{% endfor %}
