<?php

namespace App\Traits;

use App\Models\GalleryVideo;
use Cloudinary\Cloudinary;
use Cloudinary\Asset\AssetType;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

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
        $cloudinary = new Cloudinary(config('services.cloudinary.url'));

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

        $cloudinary = new Cloudinary(config('services.cloudinary.url'));
        $cloudinary->uploadApi()->destroy($publicIdOrUrl);
    }

    /**
     * Delete a video asset from Cloudinary.
     *
     * Unlike deleteFromCloudinary, this passes resource_type: 'video' so Cloudinary
     * knows to delete a video resource rather than an image.
     *
     * @param string $publicId The Cloudinary public ID of the video asset.
     */
    protected function deleteVideoFromCloudinary(string $publicId): void
    {
        $cloudinary = new Cloudinary(config('services.cloudinary.url'));
        $cloudinary->uploadApi()->destroy($publicId, [
            'resource_type' => 'video',
        ]);
    }

    /**
     * Build the Laravel validation rules array for a featured video upload.
     *
     * File-type (mimetype/extension) and max-size validation are handled natively
     * by Laravel. Duration validation must be done post-upload using the metadata
     * returned by Cloudinary (width, height, duration).
     *
     * @return array<string, mixed>
     */
    protected function videoUploadRules(): array
    {
        return [
            'video'   => [
                'required',
                'file',
                'mimes:mp4,mov',
                'max:51200', // 50 MB in kilobytes
            ],
            'title'   => ['required', 'string', 'max:150'],
        ];
    }

    /**
     * Upload a video to Cloudinary with asynchronous eager transformation.
     *
     * The upload returns immediately with a raw/unconverted video URL. Cloudinary
     * queues the 720p H.264/MP4 transformation asynchronously. The raw URL is
     * stored in `pending_video_url` on the GalleryVideo record; ProcessFeaturedVideoUpload
     * polls Cloudinary until the transformation completes, then populates `video_url`
     * and `status = 'active'`.
     *
     * This bypasses the synchronous upload size ceiling (Cloudinary rejects
     * synchronous eager transforms for files over ~100 MB with
     * "Video is too large to process synchronously").
     *
     * NOTE: the `eager` param MUST be an array of qualifiers (not a raw URL-syntax
     * string), otherwise the SDK's AssetTransformation serialiser doubles the format
     * qualifier (producing e.g. "w_720,h_720,c_limit,q_auto,f_mp4/f_mp4") and
     * Cloudinary silently ignores the malformed eager string — no transformation
     * is ever queued.
     *
     * @param UploadedFile $file   The uploaded video file (mp4 or mov).
     * @param string       $folder The Cloudinary folder to upload into.
     * @return array{pending_video_url: string, public_id: string, is_portrait: bool}
     */
    protected function uploadVideoToCloudinaryAsync(UploadedFile $file, string $folder): array
    {
        $cloudinary = new Cloudinary(config('services.cloudinary.url'));

        // Eager transformation: transcode to H.264/MP4, cap at 720p on BOTH
        // dimensions (c_limit constrains width AND height while preserving aspect
        // ratio). For a portrait source (e.g. 720x1280), the height bound of 720
        // is already satisfied so only width gets capped — portrait is preserved.
        // Passed as an array of qualifiers — NOT a raw string — so the SDK's
        // AssetTransformation serialiser produces "w_720,h_720,c_limit,q_auto/f_mp4"
        // instead of the malformed double-format "w_720,h_720,c_limit,q_auto,f_mp4/f_mp4"
        // that Cloudinary silently ignores.
        $eagerTransformation = [
            'width'   => 720,
            'height'  => 720,
            'crop'    => 'limit',
            'quality' => 'auto',
            'format'  => 'mp4',
        ];

        $result = $cloudinary->uploadApi()->upload($file->getRealPath(), [
            'folder'        => $folder,
            'resource_type' => AssetType::VIDEO,
            'eager'        => $eagerTransformation,
            'eager_async'  => true,
        ]);

        Log::info('uploadVideoToCloudinaryAsync: video uploaded with async eager', [
            'public_id' => $result['public_id'] ?? 'N/A',
        ]);

        $width     = (int) ($result['width'] ?? 0);
        $height    = (int) ($result['height'] ?? 0);

        return [
            'pending_video_url' => $result['secure_url'],
            'public_id'        => $result['public_id'],
            'is_portrait'      => $height > $width,
        ];
    }

    /**
     * Build a Cloudinary thumbnail URL for a video by appending image transformation
     * parameters to the video's secure URL.
     *
     * Cloudinary generates a thumbnail by treating the video URL as an image source
     * and appending fl_splice (splice the first frame) plus standard image
     * transformation params.
     *
     * @param string $videoUrl The Cloudinary secure URL of the video.
     * @return string The thumbnail URL.
     */
    protected function buildVideoThumbnailUrl(string $videoUrl): string
    {
        // Replace the video file extension with .jpg to signal image output
        $thumbnailUrl = preg_replace('/\.(mp4|mov|avi|mkv)$/i', '.jpg', $videoUrl);

        // Append transformation to extract a representative frame.
        // w_300: cap thumbnail width at 300px (height auto-scales to match aspect ratio)
        // q_auto: auto quality
        // f_jpg: output as JPEG
        // fl_splice,fl_layer_apply: splice the first frame of the video as the thumbnail
        return $thumbnailUrl . '/w_300,q_auto,f_jpg,fl_splice,fl_layer_apply';
    }

    /**
     * Replace the currently active featured video with a new one (async variant).
     *
     * Uploads the video with eager_async=true, creates a DB record with
     * status='processing', then dispatches ProcessFeaturedVideoUpload to poll
     * Cloudinary and populate the final video_url once the transformation is done.
     *
     * Unlike the old synchronous upload path, this returns immediately so the
     * frontend can show a "processing" state while transcoding runs on Cloudinary.
     *
     * @param UploadedFile $file   The uploaded video file.
     * @param string       $title  The required title.
     * @param int          $userId The authenticated admin's user ID.
     * @return GalleryVideo The newly created GalleryVideo record (status='processing').
     *
     * @throws \Cloudinary\Api\Exception\ApiError  If the upload fails.
     */
    protected function replaceFeaturedVideoAsync(UploadedFile $file, string $title, int $userId): GalleryVideo
    {
        // ── Step 1: delete any currently active video ──────────────────────────
        $previous = GalleryVideo::active()->first();

        if ($previous) {
            try {
                $this->deleteVideoFromCloudinary($previous->public_id);
                Log::info('replaceFeaturedVideoAsync: deleted previous Cloudinary asset', [
                    'public_id' => $previous->public_id,
                ]);
            } catch (\Throwable $e) {
                Log::error('replaceFeaturedVideoAsync: failed to delete previous Cloudinary asset', [
                    'public_id' => $previous->public_id,
                    'error'     => $e->getMessage(),
                ]);
            }
            $previous->delete();
            Log::info('replaceFeaturedVideoAsync: deleted previous GalleryVideo record', [
                'id' => $previous->id,
            ]);
        }

        // ── Step 2: upload with async eager, create processing record ───────────
        $meta = $this->uploadVideoToCloudinaryAsync($file, 'kartar/videos');

        $galleryVideo = GalleryVideo::create([
            'uploaded_by'       => $userId,
            'title'            => $title,
            'pending_video_url' => $meta['pending_video_url'],
            'public_id'        => $meta['public_id'],
            'is_portrait'      => $meta['is_portrait'],
            'expires_at'       => now()->addDays(7),
            'status'           => 'processing',
        ]);

        // Dispatch the polling job — it will run on the next queue:work cron tick.
        \App\Jobs\ProcessFeaturedVideoUpload::dispatch(
            $galleryVideo->id,
            $meta['public_id']
        );

        Log::info('replaceFeaturedVideoAsync: processing record created, job dispatched', [
            'gallery_video_id' => $galleryVideo->id,
            'public_id'       => $meta['public_id'],
        ]);

        return $galleryVideo;
    }
}
