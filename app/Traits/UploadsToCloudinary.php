<?php

namespace App\Traits;

use Cloudinary\Cloudinary;

trait UploadsToCloudinary
{
    /**
     * Upload a file to Cloudinary.
     *
     * @param \Illuminate\Http\UploadedFile|\SplFileInfo|string $file
     * @param string $folder
     * @return array{url: string, public_id: string}
     */
    protected function uploadToCloudinaryWithPublicId($file, string $folder): array
    {
        $cloudinary = new Cloudinary();

        $result = $cloudinary->uploadApi()->upload($file->getRealPath(), [
            'folder' => $folder,
        ]);

        return [
            'url' => $result['secure_url'],
            'public_id' => $result['public_id'],
        ];
    }

    /**
     * Upload a file to Cloudinary (legacy method - returns only URL).
     *
     * @param \Illuminate\Http\UploadedFile|\SplFileInfo|string $file
     * @param string $folder
     * @return string
     */
    protected function uploadToCloudinary($file, string $folder): string
    {
        $result = $this->uploadToCloudinaryWithPublicId($file, $folder);
        return $result['url'];
    }

    /**
     * Delete a file from Cloudinary.
     *
     * @param string $publicIdOrUrl Either a public_id directly, or a full Cloudinary URL.
     *                              If a URL is passed, it will be parsed to extract the public_id.
     */
    protected function deleteFromCloudinary(string $publicIdOrUrl): void
    {
        // If it's a URL (contains upload path), extract the public_id
        if (str_contains($publicIdOrUrl, '/upload/')) {
            // Pattern: .../upload/v\d+/FOLDER/PUBLIC_ID or .../upload/FOLDER/PUBLIC_ID
            $publicIdOrUrl = preg_replace('#.*/upload/(?:v\d+/)?#', '', $publicIdOrUrl);
            $publicIdOrUrl = preg_replace('/\.[^.]+$/', '', $publicIdOrUrl); // Remove file extension
        }

        $cloudinary = new Cloudinary();
        $cloudinary->uploadApi()->destroy($publicIdOrUrl);
    }
}
