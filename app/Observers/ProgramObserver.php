<?php

namespace App\Observers;

use App\Models\Program;
use App\Notifications\AdminActivityNotification;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class ProgramObserver
{
    private const MODEL_LABEL = 'program';

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
        $user = Auth::user();

        if (!$user) {
            return;
        }

        if ($user->isSuperAdmin()) {
            return;
        }

        $actionLabel = match ($action) {
            'created' => 'menambahkan program baru',
            'updated' => 'mengedit program',
            'deleted' => 'menghapus program',
            default => $action,
        };

        $superAdmins = User::where('role', 'super_admin')->get();

        foreach ($superAdmins as $superAdmin) {
            $superAdmin->notify(new AdminActivityNotification(
                actorEmail: $user->email,
                actionLabel: $actionLabel,
                modelType: 'Program',
                itemName: $program->name,
                modelId: $program->id
            ));
        }
    }
}
