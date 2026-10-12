<?php

namespace App\Support;

use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HtmlSanitizer\HtmlSanitizer;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;

class VacancyDescription
{
    public static function sanitize(string $html): string
    {
        /** @var FilesystemAdapter $publicDisk */
        $publicDisk = Storage::disk('public');

        $config = (new HtmlSanitizerConfig)
            ->allowLinkSchemes(['http', 'https', 'mailto'])
            ->allowMediaSchemes(['http', 'https'])
            ->allowMediaHosts([parse_url($publicDisk->url(''), PHP_URL_HOST)])
            ->withMaxInputLength(200000);

        $allowedTags = [
            'p',
            'br',
            'strong',
            'b',
            'em',
            'i',
            'u',
            's',
            'h2',
            'h3',
            'ul',
            'ol',
            'li',
            'blockquote',
            'span',
        ];

        foreach ($allowedTags as $tag) {
            $config = $config->allowElement($tag, []);
        }

        $config = $config->allowElement('a', ['href', 'title']);
        $config = $config->allowElement('img', ['src', 'alt', 'title']);

        return (new HtmlSanitizer($config))->sanitize($html);
    }
}
