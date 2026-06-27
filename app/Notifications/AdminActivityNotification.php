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
        public string $actorEmail,
        public string $actionLabel,
        public string $modelType,
        public string $itemName,
        public int $modelId
    ) {}

    public function via(object $notifiable): array
    {
        return [WebPushChannel::class];
    }

    public function toWebPush(object $notifiable, notification $notification): WebPushMessage
    {
        $body = "{$this->actorEmail} {$this->actionLabel}: {$this->itemName}";

        return (new WebPushMessage)
            ->title('Aktivitas Admin')
            ->body($body)
            ->icon('/icons/icon-192.png')
            ->badge('/icons/icon-192.png')
            ->data([
                'type' => 'admin_activity',
                'actor_email' => $this->actorEmail,
                'action_label' => $this->actionLabel,
                'model_type' => $this->modelType,
                'item_name' => $this->itemName,
                'model_id' => $this->modelId,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'admin_activity',
            'actor_email' => $this->actorEmail,
            'action_label' => $this->actionLabel,
            'model_type' => $this->modelType,
            'item_name' => $this->itemName,
            'model_id' => $this->modelId,
        ];
    }
}
