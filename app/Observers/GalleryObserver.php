<?php

namespace App\Observers;

use App\Models\Gallery;
use App\Notifications\AdminActivityNotification;
use App\Models\User;

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
        $user = auth()->user();

        if (!$user) {
            return;
        }

        if ($user->isSuperAdmin()) {
            return;
        }

        $superAdmins = User::where('role', 'super_admin')->get();

        foreach ($superAdmins as $superAdmin) {
            $superAdmin->notify(new AdminActivityNotification(
                actorName: $user->name,
                action: $action,
                modelType: 'Gallery',
                modelName: $gallery->title,
                modelId: $gallery->id
            ));
        }
    }
}
