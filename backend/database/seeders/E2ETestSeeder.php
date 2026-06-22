<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class E2ETestSeeder extends Seeder
{
    public function run(): void
    {
        // Disable FK checks so we can truncate tables with FK constraints
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        // Clear existing data
        DB::table('applications')->truncate();
        DB::table('proposals')->truncate();
        DB::table('personal_access_tokens')->truncate();
        DB::table('users')->truncate();
        DB::table('knowledge_areas')->truncate();
        DB::table('departments')->truncate();

        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        // Departments
        $departments = [
            ['id' => 1, 'name' => 'Ciência da Computação',  'code' => 'CC'],
            ['id' => 2, 'name' => 'Sistemas de Informação',  'code' => 'SI'],
            ['id' => 3, 'name' => 'Engenharia de Software',  'code' => 'ES'],
        ];

        foreach ($departments as $dept) {
            DB::table('departments')->insert(array_merge($dept, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Knowledge Areas
        $areas = [
            ['id' => 1, 'name' => 'Inteligência Artificial'],
            ['id' => 2, 'name' => 'Banco de Dados'],
            ['id' => 3, 'name' => 'Redes de Computadores'],
            ['id' => 4, 'name' => 'Engenharia de Software'],
        ];

        foreach ($areas as $area) {
            DB::table('knowledge_areas')->insert(array_merge($area, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Users
        $users = [
            [
                'id'             => 1,
                'name'           => 'Estudante Teste',
                'email'          => 'student@test.com',
                'password'       => Hash::make('password123'),
                'role'           => 'student',
                'department_id'  => 1,
                'profile_link'   => null,
            ],
            [
                'id'             => 2,
                'name'           => 'Professor Teste',
                'email'          => 'professor@test.com',
                'password'       => Hash::make('password123'),
                'role'           => 'professor',
                'department_id'  => 1,
                'profile_link'   => null,
            ],
            [
                'id'             => 3,
                'name'           => 'Professor Dois',
                'email'          => 'professor2@test.com',
                'password'       => Hash::make('password123'),
                'role'           => 'professor',
                'department_id'  => 2,
                'profile_link'   => null,
            ],
        ];

        foreach ($users as $user) {
            DB::table('users')->insert(array_merge($user, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Proposals (all owned by professor@test.com, id=2)
        $proposals = [
            [
                'id'             => 1,
                'professor_id'   => 2,
                'title'          => 'Redes Neurais para Reconhecimento de Imagens',
                'description'    => 'Estudo aprofundado de arquiteturas de redes neurais convolucionais aplicadas ao reconhecimento de padrões visuais em conjuntos de dados médicos.',
                'prerequisites'  => 'Python, álgebra linear',
                'max_slots'      => 2,
                'department_id'  => 1,
                'area_id'        => 1,
                'status'         => 'open',
            ],
            [
                'id'             => 2,
                'professor_id'   => 2,
                'title'          => 'Blockchain para Certificação Acadêmica',
                'description'    => 'Desenvolvimento de um sistema descentralizado baseado em blockchain para emissão e verificação de certificados acadêmicos.',
                'prerequisites'  => null,
                'max_slots'      => 1,
                'department_id'  => 2,
                'area_id'        => 2,
                'status'         => 'open',
            ],
            [
                'id'             => 3,
                'professor_id'   => 2,
                'title'          => 'Proposta Finalizada de Teste',
                'description'    => 'Esta é uma proposta com status fechado para testar cenários de proposta encerrada.',
                'prerequisites'  => null,
                'max_slots'      => 1,
                'department_id'  => 1,
                'area_id'        => 1,
                'status'         => 'closed',
            ],
        ];

        foreach ($proposals as $proposal) {
            DB::table('proposals')->insert(array_merge($proposal, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Applications (for dashboard approve/reject testing)
        $applications = [
            [
                'id'            => 1,
                'student_id'    => 1,
                'proposal_id'   => 1,
                'status'        => 'pending',
                'feedback'      => null,
                'applied_at'    => now(),
                'reviewed_at'   => null,
            ],
            [
                'id'            => 2,
                'student_id'    => 1,
                'proposal_id'   => 3,
                'status'        => 'approved',
                'feedback'      => 'Ótimo projeto!',
                'applied_at'    => now(),
                'reviewed_at'   => now(),
            ],
        ];

        foreach ($applications as $app) {
            DB::table('applications')->insert(array_merge($app, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
