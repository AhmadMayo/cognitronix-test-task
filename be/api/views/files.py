import zipfile
from os import path, listdir, remove
from shutil import rmtree
from django.conf import settings
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework import status
from django.core.files.storage import default_storage
from PIL import Image

from ..serializers import UploadZipSerializer
from ..errors_codes import ErrorCodes


def get_files_in_folder(folder_path, base_url):
    files_names = listdir(folder_path)
    data = []
    for file in files_names:
        try:
            with Image.open(path.join(folder_path, file)) as img:
                width, height = img.size
                data.append(
                    {
                        "url": f"{base_url}/{file}",
                        "name": file,
                        "width": width,
                        "height": height,
                    }
                )
        except Exception as e:
            print(f"Error opening or processing image '{file}': {e}")
            continue
    return data


class FilesViewSet(ViewSet):
    def list(self, request):
        data = []
        if path.exists(settings.MEDIA_ROOT):
            folders_names = listdir(settings.MEDIA_ROOT)
            # Sort folders from newest to oldest
            folders_names.sort(
                key=lambda name: path.getmtime(path.join(settings.MEDIA_ROOT, name)),
                reverse=True,
            )
            # Get number of files in each folder
            for folder in folders_names:
                folder_path = path.join(settings.MEDIA_ROOT, folder)
                files_count = sum(1 for entry in listdir(folder_path))
                data.append({"name": folder, "files_count": files_count})

        return Response({"total_count": len(data), "data": data})

    def retrieve(self, request, pk):
        folder_path = path.join(settings.MEDIA_ROOT, pk)

        if (
            not path.exists(settings.MEDIA_ROOT)
            or not path.exists(folder_path)
            or not path.isdir(folder_path)
        ):
            return Response(
                {"error": ErrorCodes.folder_does_not_exist.value},
                status=status.HTTP_404_NOT_FOUND,
            )

        data = get_files_in_folder(folder_path, f"{settings.MEDIA_URL}{pk}")

        return Response({"total_count": len(data), "data": data})

    def create(self, request):
        serializer = UploadZipSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors["file"], status=status.HTTP_400_BAD_REQUEST
            )

        zip_file = serializer.validated_data["file"]
        # We'll create a folder with the same name of the zip file, and we'll extract the images
        # into that folder
        relative_path = default_storage.save(zip_file.name, zip_file)
        extraction_path = path.join(settings.MEDIA_ROOT, relative_path)

        try:
            with zipfile.ZipFile(extraction_path, "r") as zip_ref:
                basename, _ext = path.splitext(zip_file.name)
                folder_path = path.join(settings.MEDIA_ROOT, basename)
                zip_ref.extractall(folder_path)
                # Zipping in OSX will create a "__MACOSX" folder inside the zip file
                # If it exists, delete it
                if path.exists(path.join(folder_path, "__MACOSX ")):
                    rmtree(path.join(folder_path, "__MACOSX "))

                # Because this is a demo, we'll only allow 3 folders
                # If there's more we'll delete the oldest
                folders_names = [
                    entry
                    for entry in listdir(settings.MEDIA_ROOT)
                    if path.isdir(path.join(settings.MEDIA_ROOT, entry))
                ]
                if len(folders_names) > 2:
                    folders_with_mtime = [
                        (folder, path.getmtime(path.join(settings.MEDIA_ROOT, folder)))
                        for folder in folders_names
                    ]
                    folders_with_mtime.sort(key=lambda x: x[1])
                    oldest_folder = folders_with_mtime[0][0]
                    rmtree(path.join(settings.MEDIA_ROOT, oldest_folder))

                files = get_files_in_folder(
                    folder_path, f"{settings.MEDIA_URL}{basename}"
                )
            return Response({"total_count": len(files), "data": files})

        except Exception:
            return Response(
                {"error": ErrorCodes.internal_error.value},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        finally:
            if path.exists(extraction_path):
                remove(extraction_path)
