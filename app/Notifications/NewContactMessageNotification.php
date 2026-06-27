<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

class NewContactMessageNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $contactName,
        public string $message,
        public int $contactId
    ) {}

    public function via(object $notifiable): array
    {
        return [WebPushChannel::class];
    }

    public function toWebPush(object $notifiable, notification $notification): WebPushMessage
    {
        $truncatedMessage = \Str::limit($this->message, 50);

        return (new WebPushMessage)
            ->title('Pesan Baru dari ' . $this->contactName)
            ->body($truncatedMessage)
            ->icon('/icons/icon-192.png')
            ->badge('/icons/icon-192.png')
            ->data([
                'type' => 'new_contact',
                'contact_id' => $this->contactId,
                'url' => '/admin/contacts',
            ])
            ->action('Lihat Pesan', '/admin/contacts');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_contact',
            'contact_id' => $this->contactId,
            'contact_name' => $this->contactName,
            'message' => \Str::limit($this->message, 50),
        ];
    }
}
