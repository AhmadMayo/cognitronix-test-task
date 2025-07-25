from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from .views import FilesViewSet
from .views import PredictionsViewSet

router = DefaultRouter()
router.register(r"files", FilesViewSet, basename="files")
router.register(r"predict", PredictionsViewSet, basename="predictions")

urlpatterns = [path("apis/", include(router.urls))] + static(
    settings.MEDIA_URL, document_root=settings.MEDIA_ROOT
)
