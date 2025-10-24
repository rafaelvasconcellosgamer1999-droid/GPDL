<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Scope extends Model
{
    protected $table = 'scopes';
    
    public $timestamps = false;

    protected $fillable = [
        'nome',
        'descricao'
    ];
}