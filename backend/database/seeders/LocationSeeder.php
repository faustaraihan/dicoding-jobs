<?php

namespace Database\Seeders;

use App\Models\Location;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $json = File::get(database_path('data/locations.json'));

        $locations = json_decode(
            $json,
            true,
            512,
            JSON_THROW_ON_ERROR,
        );

        DB::transaction(function () use ($locations): void {
            foreach ($locations as $location) {
                Location::updateOrCreate(
                    ['id' => $location['id']],
                    [
                        'name' => $location['name'],
                        'province' => $location['province'],
                    ],
                );
            }
        });
    }
}
