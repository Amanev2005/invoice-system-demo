from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from django.conf import settings
from django.conf.urls.static import static

def home(request):
    return HttpResponse("Invoice System API - Visit /api/invoices/ for API endpoints or /admin/ for admin panel")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('invoices.urls')),
    path('', home),
]

# Serve media files - enabled for both development and production (standalone usage)
from django.urls import re_path
from django.views.static import serve

urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {
        'document_root': settings.MEDIA_ROOT,
    }),
]
