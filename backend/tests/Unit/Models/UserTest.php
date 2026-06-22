<?php

namespace Tests\Unit\Models;

use App\Models\Application;
use App\Models\Department;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_is_professor_returns_true_for_professor_role(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);

        $this->assertTrue($professor->isProfessor());
        $this->assertFalse($professor->isStudent());
    }

    public function test_is_student_returns_true_for_student_role(): void
    {
        $student = User::factory()->create(['role' => 'student']);

        $this->assertTrue($student->isStudent());
        $this->assertFalse($student->isProfessor());
    }

    public function test_password_is_hashed_on_create(): void
    {
        $user = User::factory()->create(['password' => 'plain-text']);

        $this->assertNotEquals('plain-text', $user->password);
        $this->assertTrue(\Hash::check('plain-text', $user->password));
    }

    public function test_user_has_proposals_relation(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);
        Proposal::factory()->count(2)->create(['professor_id' => $professor->id]);

        $this->assertCount(2, $professor->proposals);
    }

    public function test_user_has_applications_relation(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $professor = User::factory()->create(['role' => 'professor']);

        $p1 = Proposal::factory()->create(['professor_id' => $professor->id]);
        $p2 = Proposal::factory()->create(['professor_id' => $professor->id]);
        $p3 = Proposal::factory()->create(['professor_id' => $professor->id]);

        Application::factory()->create(['student_id' => $student->id, 'proposal_id' => $p1->id]);
        Application::factory()->create(['student_id' => $student->id, 'proposal_id' => $p2->id]);
        Application::factory()->create(['student_id' => $student->id, 'proposal_id' => $p3->id]);

        $this->assertCount(3, $student->applications);
    }

    public function test_user_has_department_relation(): void
    {
        $dept = Department::create(['name' => 'CC', 'code' => 'CC']);
        $user = User::factory()->create(['department_id' => $dept->id]);

        $this->assertNotNull($user->department);
        $this->assertEquals('CC', $user->department->code);
    }
}
