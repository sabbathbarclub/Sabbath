from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from core.views import health_check

from django.views.static import serve
from django.urls import re_path

urlpatterns = [
    path("", health_check, name='health-check'),
    path("admin/", admin.site.urls),
    path("api/", include("core.urls")),
    re_path(r'^media/(?P<path>.*)$', serve,{'document_root': settings.MEDIA_ROOT}), 
]
