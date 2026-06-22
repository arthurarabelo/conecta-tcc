<?php

namespace Tests\Unit\Models;

use App\Models\Department;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DepartmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_department_can_be_created(): void
    {
        $dept = Department::create(['name' => 'Ciência da Computação', 'code' => 'CC']);

        $this->assertEquals('Ciência da Computação', $dept->name);
        $this->assertEquals('CC', $dept->code);
    }

    public function test_department_has_users_relation(): void
    {
        $dept = Department::create(['name' => 'CC', 'code' => 'CC']);
        User::factory()->count(3)->create(['department_id' => $dept->id]);

        $this->assertCount(3, $dept->users);
    }

    public function test_department_has_proposals_relation(): void
    {
        $dept = Department::create(['name' => 'CC', 'code' => 'CC']);
        $professor = User::factory()->create(['role' => 'professor', 'department_id' => $dept->id]);
        Proposal::factory()->count(2)->create([
            'professor_id' => $professor->id,
            'department_id' => $dept->id,
        ]);

        $this->assertCount(2, $dept->proposals);
    }
}
