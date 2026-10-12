<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vacancies', function (Blueprint $table) {
            $table->dropColumn('location');

            $table->foreignId('location_id')
                ->constrained('locations')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('vacancies', function (Blueprint $table) {
            $table->dropConstrainedForeignId('location_id');
            $table->string('location');
        });
    }
};
