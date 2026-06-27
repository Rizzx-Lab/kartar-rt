<?php

namespace App\Observers;

use App\Models\Program;
use App\Notifications\AdminActivityNotification;
use App\Models\User;

class ProgramObserver
{
    public function created(Program $program): void
    {
        $this->notifySuperAdmins($program, 'created');
    }

    public function updated(Program $program): void
    {
        $this->notifySuperAdmins($program, 'updated');
    }

    public function deleted(Program $program): void
    {
        $this->notifySuperAdmins($program, 'deleted');
    }

    protected function notifySuperAdmins(Program $program, string $action): void
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
                modelType: 'Program',
                modelName: $program->name,
                modelId: $program->id
            ));
        }
    }
}
