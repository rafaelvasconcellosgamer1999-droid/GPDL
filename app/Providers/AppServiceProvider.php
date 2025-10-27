<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Fortify\Contracts\LogoutResponse;
use App\Http\Responses\CustomLogoutResponse;    

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
    public function boot(): void
    {
        //
    }
}
