<?php

namespace App\Observers;

use App\Models\Gallery;
use App\Notifications\AdminActivityNotification;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class GalleryObserver
{
    public function created(Gallery $gallery): void
    {
        $this->notifySuperAdmins($gallery, 'created');
    }

    public function updated(Gallery $gallery): void
    {
        $this->notifySuperAdmins($gallery, 'updated');
    }

    public function deleted(Gallery $gallery): void
    {
        $this->notifySuperAdmins($gallery, 'deleted');
    }

    protected function notifySuperAdmins(Gallery $gallery, string $action): void
    {
        $user = Auth::user();

        if (!$user) {
            return;
        }

        if ($user->isSuperAdmin()) {
            return;
        }

        $actionLabel = match ($action) {
            'created' => 'menambahkan galeri baru',
            'updated' => 'mengedit galeri',
            'deleted' => 'menghapus galeri',
            default => $action,
        };

        $superAdmins = User::where('role', 'super_admin')->get();

        foreach ($superAdmins as $superAdmin) {
            $superAdmin->notify(new AdminActivityNotification(
                actorEmail: $user->email,
                actionLabel: $actionLabel,
                modelType: 'Gallery',
                itemName: $gallery->title,
                modelId: $gallery->id
            ));
        }
    }
}
