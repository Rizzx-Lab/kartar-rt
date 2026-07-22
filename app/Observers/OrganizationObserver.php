<?php

namespace App\Observers;

use App\Models\OrganizationMember;
use App\Notifications\AdminActivityNotification;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class OrganizationObserver
{
    public function created(OrganizationMember $member): void
    {
        $this->clearAboutCache();
        $this->notifySuperAdmins($member, 'created');
    }

    public function updated(OrganizationMember $member): void
    {
        $this->clearAboutCache();
        $this->notifySuperAdmins($member, 'updated');
    }

    public function deleted(OrganizationMember $member): void
    {
        $this->clearAboutCache();
        $this->notifySuperAdmins($member, 'deleted');
    }

    protected function clearAboutCache(): void
    {
        Cache::forget('api:about');
    }

    protected function notifySuperAdmins(OrganizationMember $member, string $action): void
    {
        $user = Auth::user();

        if (!$user) {
            return;
        }

        if ($user->isSuperAdmin()) {
            return;
        }

        $actionLabel = match ($action) {
            'created' => 'menambahkan struktur organisasi baru',
            'updated' => 'mengedit struktur organisasi',
            'deleted' => 'menghapus struktur organisasi',
            default => $action,
        };

        $superAdmins = User::where('role', 'super_admin')->get();

        foreach ($superAdmins as $superAdmin) {
            $superAdmin->notify(new AdminActivityNotification(
                actorEmail: $user->email,
                actionLabel: $actionLabel,
                modelType: 'OrganizationMember',
                itemName: $member->name,
                modelId: $member->id
            ));
        }
    }
}
