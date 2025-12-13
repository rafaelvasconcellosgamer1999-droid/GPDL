<?php

namespace App\Services;

use Carbon\Carbon;

class ProcessoParser
{
    /**
     * Parser aproximado baseado nos exemplos de publicação enviados.
     * Não calcula prazo: usa as datas já presentes no texto.
     */
    public function parsePublicacaoLote(string $texto): array
    {
        $t = trim(preg_replace('/\r\n?/', "\n", $texto));
        $out = ['numero' => $this->extrairNumeroProcesso($t)];

        // Órgão: primeira linha
        $linhas = preg_split('/\n+/', $t) ?: [];
        if (!empty($linhas)) {
            $primeira = trim($linhas[0]);
            if ($primeira !== '') $out['orgao'] = $primeira;
        }

        // Ação
        if (preg_match('/^\s*(Decisão|Intimação|Sentença|Despacho|Citação|Notificação|Ato\s+Ordinatório|Juntada|Distribuição|Conclusão|Conclusões)\b(?:[^\n]*?\((\d+)\))?/miu', $t, $m)) {
            $out['acao'] = isset($m[2]) && $m[2] !== '' ? ($m[1] . ' (' . $m[2] . ')') : $m[1];
        }

        // Assunto: após o CNJ na mesma linha
        if (!empty($out['numero']) && preg_match('/' . preg_quote($out['numero'], '/') . '\s*([^\n]+)/u', $t, $m)) {
            $poss = trim($m[1]);
            if ($poss !== '') $out['assunto'] = $poss;
        }
        if (empty($out['assunto'])) {
            foreach ($linhas as $ln) {
                $s = trim($ln);
                if ($s === '') continue;
                if (preg_match('/\b(IPTU|ISS|Invent[áa]rio|Partilha|Tribut[áa]rio|Municipais?)\b/iu', $s)) {
                    $out['assunto'] = $s;
                    break;
                }
            }
        }

        // Partes
        if (preg_match('/^(.+?)\s+X\s+(.+)$/mi', $t, $m)) {
            $out['partes'] = trim($m[1] . ' X ' . $m[2]);
        }

        // Vara/Juízo: linha com "Vara", "Juizado" ou "Turma"
        foreach ($linhas as $ln) {
            if (preg_match('/(\d+ª?\s+Vara[^\n]+|Juizado[^\n]+|Turma[^\n]+)/iu', $ln, $m)) {
                $out['vara'] = trim($m[1]);
                break;
            }
        }

        // Ciência
        if (preg_match('/ci[êe]ncia[^\n]*?([0-3]\d\/[01]\d\/[12]\d{3})(?:\s+(\d{2}:\d{2}))?/iu', $t, $m)) {
            $dt = $m[1] . (isset($m[2]) ? (' ' . $m[2]) : ' 00:00');
            $out['ciencia'] = Carbon::createFromFormat('d/m/Y H:i', $dt);
        } elseif (preg_match('/Expedi[çc][ãa]o\s+eletr[ôo]nica\s*\(([0-3]\d\/[01]\d\/[12]\d{3})\s*(\d{2}:\d{2})?/iu', $t, $m)) {
            $dt = $m[1] . (isset($m[2]) ? (' ' . $m[2]) : ' 00:00');
            $out['ciencia'] = Carbon::createFromFormat('d/m/Y H:i', $dt);
        }

        // Data limite apenas de manifestacao (nao confundir com ciencia)
        if (preg_match('/Data\s+limite[^:]*:\s*([0-3]\d\/[01]\d\/[12]\d{3})\s*(\d{2}:\d{2})?/iu', $t, $m)) {
            $dt = $m[1] . (isset($m[2]) ? (' ' . $m[2]) : ' 00:00');
            $out['limite'] = Carbon::createFromFormat('d/m/Y H:i', $dt);
            // Se a mesma linha de "Data limite" indica ciencia, nao registrar como prazo de manifestacao
            $tPlain = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $t);
            if ($tPlain === false) {
                $tPlain = $t;
            }
            if (preg_match('/Data\s+limite[^\n]*ciencia/iu', $tPlain)) {
                unset($out['limite']);
            }
        }

        // Último movimento
        if (preg_match('/último\s+movimento:\s*([^\n]+)/iu', $t, $m)) {
            $out['movimento'] = trim($m[1]);
            if (preg_match('/([0-3]\d\/[01]\d\/[12]\d{3})\s*(\d{2}:\d{2})?/', $out['movimento'], $md)) {
                $dt = $md[1] . (isset($md[2]) ? (' ' . $md[2]) : ' 00:00');
                try {
                    $out['mov_data'] = Carbon::createFromFormat('d/m/Y H:i', $dt);
                } catch (\Exception $e) {
                }
            }
        }

        // Fallback de ação caso não tenha sido capturado nos padrões acima
        if (empty($out['acao'])) {
            $tn = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $t);
            if ($tn === false) {
                $tn = $t;
            }
            if (preg_match('/^\s*(Decisao|Intimacao|Sentenca|Despacho|Citacao|Notificacao|Ato\s+Ordinatorio|Juntada|Distribuicao|Conclusao|Conclusoes)\b/mi', $tn, $mm)) {
                $out['acao'] = $mm[1];
            }
        }
        return $out;
    }

    public function extrairNumeroProcesso(string $texto): ?string
    {
        // Padrão CNJ: 0001234-56.2023.8.26.0100
        $padroes = [
            '/\b\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b/u',
            '/\b\d{20,25}\b/u', // apenas dígitos longos
        ];

        foreach ($padroes as $rx) {
            if (preg_match($rx, $texto, $m)) {
                return $m[0];
            }
        }
        return null;
    }

    public function extrairAssunto(string $texto): string
    {
        // Usa a primeira linha como assunto, limitado a 180 chars
        $linha1 = trim(strtok($texto, "\n"));
        $linha1 = preg_replace('/\s+/', ' ', $linha1);
        return mb_substr($linha1 ?: 'Processo importado', 0, 180);
    }

    public function extrairPartes(string $texto): ?string
    {
        // Heurística simples: retorna as 10 primeiras linhas como contexto
        $linhas = preg_split('/\n/', trim($texto)) ?: [];
        $trecho = implode("\n", array_slice($linhas, 0, 10));
        return $trecho ?: null;
    }

    public function separarBlocos(string $texto): array
    {
        // Normaliza quebras de linha e separa por linhas em branco duplas
        $t = str_replace(["\r\n", "\r"], "\n", trim($texto));
        $parts = preg_split("/\n{2,}/", $t) ?: [];

        // Fallback: se não houve separação, usa o texto inteiro
        if (count($parts) === 0) {
            $parts = [$t];
        }

        // Remove blocos muito pequenos (ruído)
        return array_values(array_filter(array_map('trim', $parts), function ($p) {
            return mb_strlen($p) > 3;
        }));
    }
}
