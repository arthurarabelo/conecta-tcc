<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['id' => 1, 'name' => 'Ciência da Computação',  'code' => 'CC'],
            ['id' => 2, 'name' => 'Engenharia de Software',  'code' => 'ES'],
            ['id' => 3, 'name' => 'Sistemas de Informação',  'code' => 'SI'],
            ['id' => 4, 'name' => 'Engenharia Elétrica',     'code' => 'EE'],
            ['id' => 5, 'name' => 'Matemática',              'code' => 'MAT'],
        ];

        foreach ($departments as $dept) {
            DB::table('departments')->updateOrInsert(
                ['id' => $dept['id']],
                array_merge($dept, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}
