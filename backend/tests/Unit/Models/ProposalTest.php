<?php

namespace Tests\Unit\Models;

use App\Models\Application;
use App\Models\Department;
use App\Models\KnowledgeArea;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProposalTest extends TestCase
{
    use RefreshDatabase;

    public function test_default_status_is_open(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);
        $proposal = Proposal::factory()->create(['professor_id' => $professor->id, 'status' => 'open']);

        $this->assertEquals('open', $proposal->status);
    }

    public function test_has_available_slots_when_approved_less_than_max(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);
        $proposal = Proposal::factory()->create([
            'professor_id' => $professor->id,
            'max_slots' => 3,
        ]);

        $student = User::factory()->create(['role' => 'student']);
        Application::factory()->create([
            'student_id' => $student->id,
            'proposal_id' => $proposal->id,
            'status' => 'approved',
        ]);

        $this->assertTrue($proposal->hasAvailableSlots());
    }

    public function test_has_available_slots_returns_false_when_full(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);
        $proposal = Proposal::factory()->create([
            'professor_id' => $professor->id,
            'max_slots' => 1,
        ]);

        $student = User::factory()->create(['role' => 'student']);
        Application::factory()->create([
            'student_id' => $student->id,
            'proposal_id' => $proposal->id,
            'status' => 'approved',
        ]);

        $this->assertFalse($proposal->hasAvailableSlots());
    }

    public function test_has_available_slots_ignores_pending_applications(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);
        $proposal = Proposal::factory()->create([
            'professor_id' => $professor->id,
            'max_slots' => 1,
        ]);

        $student = User::factory()->create(['role' => 'student']);
        Application::factory()->create([
            'student_id' => $student->id,
            'proposal_id' => $proposal->id,
            'status' => 'pending',
        ]);

        // Pending applications don't count — slots still available
        $this->assertTrue($proposal->hasAvailableSlots());
    }

    public function test_proposal_belongs_to_professor(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);
        $proposal = Proposal::factory()->create(['professor_id' => $professor->id]);

        $this->assertNotNull($proposal->professor);
        $this->assertEquals($professor->id, $proposal->professor->id);
    }

    public function test_proposal_belongs_to_department(): void
    {
        $dept = Department::create(['name' => 'CC', 'code' => 'CC']);
        $professor = User::factory()->create(['role' => 'professor']);
        $proposal = Proposal::factory()->create([
            'professor_id' => $professor->id,
            'department_id' => $dept->id,
        ]);

        $this->assertNotNull($proposal->department);
        $this->assertEquals('CC', $proposal->department->name);
    }

    public function test_proposal_belongs_to_knowledge_area(): void
    {
        $area = KnowledgeArea::create(['name' => 'IA']);
        $professor = User::factory()->create(['role' => 'professor']);
        $proposal = Proposal::factory()->create([
            'professor_id' => $professor->id,
            'area_id' => $area->id,
        ]);

        $this->assertNotNull($proposal->area);
        $this->assertEquals('IA', $proposal->area->name);
    }

    public function test_proposal_has_applications_relation(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);
        $proposal = Proposal::factory()->create(['professor_id' => $professor->id]);
        $student = User::factory()->create(['role' => 'student']);
        Application::factory()->count(2)->create([
            'student_id' => $student->id,
            'proposal_id' => $proposal->id,
        ]);

        $this->assertCount(2, $proposal->applications);
    }

    public function test_approved_applications_returns_only_approved(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);
        $proposal = Proposal::factory()->create(['professor_id' => $professor->id]);

        $s1 = User::factory()->create(['role' => 'student']);
        $s2 = User::factory()->create(['role' => 'student']);
        $s3 = User::factory()->create(['role' => 'student']);

        Application::factory()->create(['student_id' => $s1->id, 'proposal_id' => $proposal->id, 'status' => 'approved']);
        Application::factory()->create(['student_id' => $s2->id, 'proposal_id' => $proposal->id, 'status' => 'pending']);
        Application::factory()->create(['student_id' => $s3->id, 'proposal_id' => $proposal->id, 'status' => 'rejected']);

        $this->assertCount(3, $proposal->applications);
        $this->assertCount(1, $proposal->approvedApplications);
    }
}
