<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vacancies', function (Blueprint $table) {
            $table->id();

            $table->string('title');
            $table->string('position');
            $table->string('employment_type');
            $table->unsignedInteger('candidate_count');
            $table->dateTime('expires_at');
            $table->string('location');
            $table->boolean('is_remote')->default(false);
            $table->longText('description');
            $table->unsignedBigInteger('salary_min');
            $table->unsignedBigInteger('salary_max')->nullable();
            $table->boolean('show_salary')->default(false);
            $table->string('experience_level');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vacancies');
    }
};
