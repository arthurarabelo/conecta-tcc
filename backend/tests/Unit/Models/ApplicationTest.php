<?php

namespace Tests\Unit\Models;

use App\Models\Application;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApplicationTest extends TestCase
{
    use RefreshDatabase;

    public function test_default_status_is_pending(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $professor = User::factory()->create(['role' => 'professor']);
        $proposal = Proposal::factory()->create(['professor_id' => $professor->id]);

        $application = Application::factory()->create([
            'student_id' => $student->id,
            'proposal_id' => $proposal->id,
        ]);

        $this->assertEquals('pending', $application->status);
    }

    public function test_application_belongs_to_student(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $professor = User::factory()->create(['role' => 'professor']);
        $proposal = Proposal::factory()->create(['professor_id' => $professor->id]);

        $application = Application::factory()->create([
            'student_id' => $student->id,
            'proposal_id' => $proposal->id,
        ]);

        $this->assertNotNull($application->student);
        $this->assertEquals($student->id, $application->student->id);
    }

    public function test_application_belongs_to_proposal(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $professor = User::factory()->create(['role' => 'professor']);
        $proposal = Proposal::factory()->create(['professor_id' => $professor->id]);

        $application = Application::factory()->create([
            'student_id' => $student->id,
            'proposal_id' => $proposal->id,
        ]);

        $this->assertNotNull($application->proposal);
        $this->assertEquals($proposal->id, $application->proposal->id);
    }

    public function test_applied_at_is_datetime_cast(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $professor = User::factory()->create(['role' => 'professor']);
        $proposal = Proposal::factory()->create(['professor_id' => $professor->id]);

        $application = Application::factory()->create([
            'student_id' => $student->id,
            'proposal_id' => $proposal->id,
        ]);

        $this->assertInstanceOf(\Carbon\Carbon::class, $application->applied_at);
    }

    public function test_reviewed_at_is_null_by_default(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $professor = User::factory()->create(['role' => 'professor']);
        $proposal = Proposal::factory()->create(['professor_id' => $professor->id]);

        $application = Application::factory()->create([
            'student_id' => $student->id,
            'proposal_id' => $proposal->id,
        ]);

        $this->assertNull($application->reviewed_at);
    }
}
