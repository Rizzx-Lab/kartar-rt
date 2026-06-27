<?php

namespace App\Observers;

use App\Models\Announcement;
use App\Notifications\AdminActivityNotification;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

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
        $user = Auth::user();

        if (!$user) {
            return;
        }

        if ($user->isSuperAdmin()) {
            return;
        }

        $actionLabel = match ($action) {
            'created' => 'menambahkan pengumuman baru',
            'updated' => 'mengedit pengumuman',
            'deleted' => 'menghapus pengumuman',
            default => $action,
        };

        $superAdmins = User::where('role', 'super_admin')->get();

        foreach ($superAdmins as $superAdmin) {
            $superAdmin->notify(new AdminActivityNotification(
                actorEmail: $user->email,
                actionLabel: $actionLabel,
                modelType: 'Announcement',
                itemName: $announcement->title,
                modelId: $announcement->id
            ));
        }
    }
}
