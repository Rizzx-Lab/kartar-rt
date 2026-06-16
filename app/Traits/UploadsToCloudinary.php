<?php

namespace App\Traits;

use Cloudinary\Cloudinary;

trait UploadsToCloudinary
{
    protected function uploadToCloudinary($file, string $folder): string
    {
        $cloudinary = new Cloudinary();

        $result = $cloudinary->uploadApi()->upload($file->getRealPath(), [
            'folder' => $folder,
        ]);

        return $result['secure_url'];
    }

    protected function deleteFromCloudinary(string $url): void
    {
        $cloudinary = new Cloudinary();

        $publicId = preg_replace('#.*/upload/(?:v\d+/)?#', '', $url);
        $publicId = preg_replace('/\.[^.]+$/', '', $publicId);

        $cloudinary->uploadApi()->destroy($publicId);
    }
}