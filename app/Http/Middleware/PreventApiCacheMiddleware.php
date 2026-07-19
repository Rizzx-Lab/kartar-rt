<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware that prevents CDN/edge/ browser caching of public API responses.
 * The Laravel file-cache and Next.js ISR layers control freshness;
 * no intermediate CDN should cache these responses independently.
 */
class PreventApiCacheMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        // Vercel Edge and other CDNs respect Cache-Control directives.
        // 'no-store' means: do not store this response anywhere.
        // 'no-cache' would also work but is slightly less strict.
        // 'private' would prevent shared CDN caching but allow browser caching.
        // 'max-age=0, must-revalidate' is equivalent to no-cache.
        $response->headers->set('Cache-Control', 'no-store, max-age=0, must-revalidate, proxy-revalidate');

        // Also prevent Vercel from adding its own caching headers
        $response->headers->set('Vary', 'Accept');

        return $response;
    }
}
