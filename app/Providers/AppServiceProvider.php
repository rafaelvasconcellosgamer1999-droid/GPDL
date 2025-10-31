<?php

namespace App\Providers;

use Inertia\Inertia;
use Illuminate\Support\ServiceProvider;
use Laravel\Fortify\Contracts\LogoutResponse;
use App\Http\Responses\CustomLogoutResponse;  
use App\Services\PermissionService;  

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
{
    $this->app->singleton(LogoutResponse::class, CustomLogoutResponse::class);
}

    /**
     * Bootstrap any application services.
     */
    public function boot()
{
    Inertia::share('permissions', function () {
        $user = auth()->user();
        if (!$user) {
            return [];
        }
        return app(PermissionService::class)->getUserPermissions($user);
    });
}
}
