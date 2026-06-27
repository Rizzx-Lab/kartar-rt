<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

class AdminActivityNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $actorName,
        public string $action,
        public string $modelType,
        public string $modelName,
        public int $modelId
    ) {}

    public function via(object $notifiable): array
    {
        return [WebPushChannel::class];
    }

    public function toWebPush(object $notifiable, notification $notification): WebPushMessage
    {
        $actionText = match ($this->action) {
            'created' => 'membuat',
            'updated' => 'mengupdate',
            'deleted' => 'menghapus',
            default => $this->action,
        };

        $body = "{$this->actorName} melakukan {$actionText} pada {$this->modelType}";

        return (new WebPushMessage)
            ->title("Aktivitas Admin: {$this->modelType}")
            ->body($body)
            ->icon('/icons/icon-192.png')
            ->badge('/icons/icon-192.png')
            ->data([
                'type' => 'admin_activity',
                'actor_name' => $this->actorName,
                'action' => $this->action,
                'model_type' => $this->modelType,
                'model_name' => $this->modelName,
                'model_id' => $this->modelId,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'admin_activity',
            'actor_name' => $this->actorName,
            'action' => $this->action,
            'model_type' => $this->modelType,
            'model_name' => $this->modelName,
            'model_id' => $this->modelId,
        ];
    }
}
