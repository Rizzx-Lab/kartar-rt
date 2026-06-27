<?php

namespace App\Observers;

use App\Models\Announcement;
use App\Notifications\AdminActivityNotification;
use App\Models\User;

class AnnouncementObserver
{
    public function created(Announcement $announcement): void
    {
        $this->notifySuperAdmins($announcement, 'created');
    }

    public function updated(Announcement $announcement): void
    {
        $this->notifySuperAdmins($announcement, 'updated');
    }

    public function deleted(Announcement $announcement): void
    {
        $this->notifySuperAdmins($announcement, 'deleted');
    }

    protected function notifySuperAdmins(Announcement $announcement, string $action): void
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
                modelType: 'Announcement',
                modelName: $announcement->title,
                modelId: $announcement->id
            ));
        }
    }
}
