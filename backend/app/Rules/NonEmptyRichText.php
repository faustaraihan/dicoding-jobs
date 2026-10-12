<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class NonEmptyRichText implements ValidationRule
{
    public function validate(
        string $attribute,
        mixed $value,
        Closure $fail,
    ): void {
        if (! is_string($value)) {
            return;
        }

        $text = html_entity_decode(
            strip_tags($value),
            ENT_QUOTES | ENT_HTML5,
            'UTF-8',
        );

        $hasText = preg_match(
            '/[^\s\p{Z}\x{200B}\x{FEFF}]/u',
            $text,
        ) === 1;

        if (! $hasText) {
            $fail('Deskripsi lowongan wajib berisi teks.');
        }
    }
}
