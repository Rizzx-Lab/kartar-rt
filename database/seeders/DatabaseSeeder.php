<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Program;
use App\Models\SiteSetting;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name'     => 'Developer',
            'email'    => 'dev@kartar-rt.com',
            'password' => Hash::make('password'),
            'role'     => 'super_admin',
        ]);

        User::create([
            'name'     => 'Ketua Karang Taruna',
            'email'    => 'ketua@kartar-rt.com',
            'password' => Hash::make('password'),
            'role'     => 'admin',
        ]);

        User::create([
            'name'     => 'Pembina Karang Taruna',
            'email'    => 'pembina@kartar-rt.com',
            'password' => Hash::make('password'),
            'role'     => 'admin',
        ]);

        Program::create([
            'name'        => 'Kumpul Bocah',
            'slug'        => 'kumpul-bocah',
            'description' => 'Kegiatan rutin bulanan yang mengumpulkan anak-anak warga RT 06 untuk bermain, belajar, dan bersosialisasi bersama.',
            'frequency'   => 'monthly',
            'is_active'   => true,
            'order'       => 1,
        ]);

        Program::create([
            'name'        => '17 Agustus',
            'slug'        => '17-agustus',
            'description' => 'Perayaan HUT Kemerdekaan RI dengan berbagai perlombaan dan kegiatan seru untuk seluruh warga RT.',
            'frequency'   => 'yearly',
            'is_active'   => true,
            'order'       => 2,
        ]);

        $settings = [
            ['key' => 'site_name',        'value' => 'Karang Taruna RT 01',          'type' => 'text'],
            ['key' => 'site_tagline',     'value' => 'Bersatu, Bergerak, Bermanfaat','type' => 'text'],
            ['key' => 'rt_number',        'value' => 'RT 06 / RW 12',                'type' => 'text'],
            ['key' => 'address',          'value' => 'Jl. Manukan Lor 3F',   'type' => 'text'],
            ['key' => 'phone_ketua',      'value' => '0881027099361',                  'type' => 'text'],
            ['key' => 'email_contact',    'value' => 'info@kartar-rt.com',            'type' => 'text'],
            ['key' => 'social_instagram', 'value' => '',                              'type' => 'text'],
            ['key' => 'social_facebook',  'value' => '',                              'type' => 'text'],
            ['key' => 'about_text',       'value' => 'Karang Taruna RT kami berdiri untuk membangun kepemudaan yang aktif dan peduli lingkungan.', 'type' => 'text'],
        ];

        foreach ($settings as $s) {
            SiteSetting::create($s);
        }
    }
}