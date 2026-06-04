<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class KnowledgeAreaSeeder extends Seeder
{
    public function run(): void
    {
        $areas = [
            ['id' => 1, 'name' => 'Inteligência Artificial'],
            ['id' => 2, 'name' => 'Banco de Dados'],
            ['id' => 3, 'name' => 'Redes de Computadores'],
            ['id' => 4, 'name' => 'Engenharia de Software'],
            ['id' => 5, 'name' => 'Sistemas Distribuídos'],
            ['id' => 6, 'name' => 'Interação Humano-Computador'],
            ['id' => 7, 'name' => 'Segurança da Informação'],
            ['id' => 8, 'name' => 'Computação Gráfica'],
        ];

        foreach ($areas as $area) {
            DB::table('knowledge_areas')->updateOrInsert(
                ['id' => $area['id']],
                array_merge($area, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}
