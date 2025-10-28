<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use App\Events\DashboardUpdated;


class Processo extends Model
{
    protected $table = 'processos';

    protected $fillable = [
        'processo_pai_id',
        'orgao',
        'acao',
        'numero',
        'assunto',
        'partes_envolvidas',
        'vara_juizo',
        'procurador_responsavel_id',
        'usuario_cadastro_id',
        'data_entrada',
        'data_ciencia',
        'ultimo_mov_texto',
        'ultimo_mov_data',
        'data_limite',
        'data_finalizacao',
        'status',
        'origem_cadastro',
        'setor_id',
    ];

    protected $casts = [
        'data_entrada' => 'datetime',
        'data_ciencia' => 'datetime',
        'ultimo_mov_data' => 'datetime',
        'data_limite' => 'datetime',
        'data_finalizacao' => 'datetime',
    ];

    // ---------------------------------------------------------
    // 🚀 Limpa o cache do dashboard sempre que um processo muda
    // ---------------------------------------------------------
    protected static function booted(): void
    {
        static::saved(fn() => self::clearDashboardCache());
        static::deleted(fn() => self::clearDashboardCache());
    }

    protected static function clearDashboardCache(): void
    {
        Cache::forget('dashboard_stats');
        Cache::forget('dashboard_em_andamento');
        Cache::forget('dashboard_capacidade_ativos');
        Cache::forget('dashboard_capacidade_pendentes');
        Cache::forget('dashboard_capacidade_vencidos');
        Cache::forget('dashboard_capacidade_encerrados');

        // 🚀 Dispara evento em tempo real
        event(new DashboardUpdated());
    }

    // ---------------------------------------------------------
    // Relacionamentos
    // ---------------------------------------------------------
    public function responsavel()
    {
        return $this->belongsTo(User::class, 'procurador_responsavel_id');
    }

    public function setor()
    {
        return $this->belongsTo(Setor::class);
    }

    // ---------------------------------------------------------
    // Escopos dinâmicos para status
    // ---------------------------------------------------------
    public function scopeFinalizados($query)
    {
        return $query->whereNotNull('data_finalizacao');
    }

    public function scopeVencidos($query)
    {
        return $query->whereNull('data_finalizacao')
            ->whereNotNull('data_limite')
            ->where('data_limite', '<', now());
    }

    public function scopeAbertos($query)
    {
        return $query->whereNull('data_finalizacao')
            ->whereNotNull('data_limite')
            ->where('data_limite', '>=', now());
    }

    public function scopePendentesCiencia($query)
    {
        return $query->whereNull('data_finalizacao')
            ->whereNull('data_limite');
    }
}
